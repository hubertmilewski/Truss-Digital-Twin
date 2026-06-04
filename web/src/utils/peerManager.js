import Peer from 'peerjs';
import { useSensorStore } from '../store/useSensorStore';
import { getModelFiles } from './modelStorage';

let peer = null;
let connections = [];
let hostConnection = null;
let lastBroadcastTime = 0;

export const PeerManager = {
  initHost: () => {
    return new Promise((resolve, reject) => {
      const randomId = 'pb-' + Math.floor(1000 + Math.random() * 9000);
      console.log("[P2P] Inicjalizacja hosta z ID:", randomId);
      
      peer = new Peer(randomId, { debug: 2 });

      peer.on('open', (id) => {
        console.log("[P2P] Host gotowy! ID:", id);
        useSensorStore.getState().setSessionId(id);
        resolve(id);
      });

      peer.on('connection', (conn) => {
        console.log("[P2P] Nowy gość się łączy:", conn.peer);
        connections.push(conn);
        useSensorStore.getState().setViewerCount(connections.length);

        conn.on('close', () => {
          console.log("[P2P] Gość się rozłączył:", conn.peer);
          connections = connections.filter(c => c.peer !== conn.peer);
          useSensorStore.getState().setViewerCount(connections.length);
        });

        conn.on('open', async () => {
          console.log("[P2P] Kanał z gościem otwarty! Wysyłam INIT...");
          const state = useSensorStore.getState();
          conn.send({
            type: 'INIT',
            payload: {
              meshSensorMap: state.meshSensorMap,
              maxLoadN: state.maxLoadN,
              displayUnit: state.displayUnit,
              isRecording: state.isRecording
            }
          });

          try {
            const files = await getModelFiles();
            if (files && files.length > 0) {
              console.log("[P2P] Wysyłam pliki modelu (ilość):", files.length);
              conn.send({
                type: 'MODEL_FILES',
                payload: files
              });
            }
          } catch (e) {
            console.error("[P2P] Błąd podczas wysyłania modelu:", e);
          }
        });
      });

      peer.on('error', (err) => {
        console.error('[P2P] Błąd Hosta PeerJS:', err);
        reject(err);
      });
    });
  },

  broadcastData: (data, isRecording) => {
    if (!peer || connections.length === 0) return;
    
    const now = Date.now();
    if (now - lastBroadcastTime < 33) return; // limit ~30 FPS
    lastBroadcastTime = now;

    const message = { type: 'TELEMETRY', payload: data, isRecording };
    
    connections.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  },

  stopHost: () => {
    console.log("[P2P] Zatrzymywanie hosta...");
    if (peer) {
      peer.destroy();
      peer = null;
    }
    connections = [];
    useSensorStore.getState().setSessionId(null);
    useSensorStore.getState().setViewerCount(0);
  },
  
  initViewer: (hostId) => {
    return new Promise((resolve, reject) => {
      console.log("[P2P] Inicjalizacja gościa. Próba połączenia z:", hostId);
      peer = new Peer({ debug: 2 });

      peer.on('open', () => {
        console.log("[P2P] Gość gotowy. Nawiązywanie połączenia...");
        hostConnection = peer.connect(hostId, { reliable: true });
        
        hostConnection.on('open', () => {
          console.log("[P2P] SUKCES! Połączono z hostem:", hostId);
          useSensorStore.getState().setIsGuestMode(true);
          resolve(true);
        });

        hostConnection.on('data', (msg) => {
          const state = useSensorStore.getState();
          
          if (msg.type === 'TELEMETRY') {
            state.setSensorData(msg.payload);
            if (msg.isRecording && !state.isRecording) {
              state.startRecording();
            } else if (!msg.isRecording && state.isRecording) {
              state.stopRecording();
            }
          } else if (msg.type === 'INIT') {
            console.log("[P2P] Otrzymano konfigurację od hosta!");
            state.syncGuestConfig(msg.payload);
            if (msg.payload.isRecording && !state.isRecording) {
              state.startRecording();
            }
          } else if (msg.type === 'MODEL_FILES') {
            console.log("[P2P] Otrzymano pliki modelu z sieci!");
            const files = msg.payload;
            const gltfFile = files.find(f => f.name.toLowerCase().endsWith('.gltf') || f.name.toLowerCase().endsWith('.glb'));
            if (gltfFile) {
              const fileMap = {};
              files.forEach(f => {
                fileMap[f.name] = URL.createObjectURL(new Blob([f]));
              });
              state.setCustomModelUrl({
                mainUrl: fileMap[gltfFile.name],
                fileMap: fileMap
              });
            }
          }
        });

        hostConnection.on('close', () => {
          console.log("[P2P] Host zakończył sesję.");
          alert("Sesja została zakończona przez udostępniającego.");
          window.location.href = '/'; 
        });
        
        hostConnection.on('error', (err) => {
          console.error("[P2P] Błąd połączenia (hostConnection):", err);
        });
      });

      peer.on('error', (err) => {
        console.error("[P2P] Błąd globalny gościa:", err);
        alert("Nie udało się połączyć z hostem.");
        reject(err);
      });
    });
  }
};
