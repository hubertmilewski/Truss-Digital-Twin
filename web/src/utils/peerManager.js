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
      
      peer = new Peer(randomId, { debug: 2 });

      peer.on('open', (id) => {
        useSensorStore.getState().setSessionId(id);
        resolve(id);
      });

      peer.on('connection', (conn) => {
        connections.push(conn);
        useSensorStore.getState().setViewerCount(connections.length);

        conn.on('close', () => {
          connections = connections.filter(c => c.peer !== conn.peer);
          useSensorStore.getState().setViewerCount(connections.length);
        });

        conn.on('open', async () => {
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

          const files = await getModelFiles();
          if (files && files.length > 0) {
            conn.send({
              type: 'MODEL_FILES',
              payload: files
            });
          }
        });
      });

      peer.on('error', (err) => {
        console.error('Błąd PeerJS:', err);
        reject(err);
      });
    });
  },

  broadcastData: (data, isRecording) => {
    if (!peer || connections.length === 0) return;
    
    const now = Date.now();
    if (now - lastBroadcastTime < 33) return;
    lastBroadcastTime = now;

    const message = { type: 'TELEMETRY', payload: data, isRecording };
    
    connections.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  },

  stopHost: () => {
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
      peer = new Peer({ debug: 2 });

      peer.on('open', () => {
        hostConnection = peer.connect(hostId);
        
        hostConnection.on('open', () => {
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
            state.syncGuestConfig(msg.payload);
            if (msg.payload.isRecording && !state.isRecording) {
              state.startRecording();
            }
          } else if (msg.type === 'MODEL_FILES') {
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
          alert("Sesja została zakończona przez udostępniającego.");
          window.location.href = '/'; 
        });
      });

      peer.on('error', (err) => {
        alert("Nie udało się połączyć z hostem.");
        reject(err);
      });
    });
  }
};
