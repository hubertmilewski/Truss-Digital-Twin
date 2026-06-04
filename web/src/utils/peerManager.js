import Peer from 'peerjs';
import { useSensorStore } from '../store/useSensorStore';

let peer = null;
let connections = [];
let hostConnection = null;
let lastBroadcastTime = 0;

export const PeerManager = {
  // Dla hosta: rozpoczyna sesję, zwraca wygenerowane ID
  initHost: () => {
    return new Promise((resolve, reject) => {
      // Generujemy przyjazne ID (np. pb-1234)
      const randomId = 'pb-' + Math.floor(1000 + Math.random() * 9000);
      
      peer = new Peer(randomId, {
        debug: 2
      });

      peer.on('open', (id) => {
        console.log('Sesja P2P rozpoczęta. Twoje ID:', id);
        useSensorStore.getState().setSessionId(id);
        resolve(id);
      });

      peer.on('connection', (conn) => {
        console.log('Nowy widz dołączył:', conn.peer);
        connections.push(conn);
        useSensorStore.getState().setViewerCount(connections.length);

        conn.on('close', () => {
          connections = connections.filter(c => c.peer !== conn.peer);
          useSensorStore.getState().setViewerCount(connections.length);
        });

        // Kiedy gość się podłącza, możemy mu wysłać bieżący model i mapowania
        // Wysłanie stanu początkowego (np. model meshSensorMap)
        conn.on('open', () => {
          const state = useSensorStore.getState();
          conn.send({
            type: 'INIT',
            payload: {
              meshSensorMap: state.meshSensorMap,
              maxLoadN: state.maxLoadN,
              displayUnit: state.displayUnit
            }
          });
        });
      });

      peer.on('error', (err) => {
        console.error('Błąd PeerJS:', err);
        reject(err);
      });
    });
  },

  // Rozsyłanie danych (odpalane z serialManager)
  broadcastData: (data) => {
    if (!peer || connections.length === 0) return;
    
    // Ograniczenie do ~30 fps dla widzów żeby nie zabić im baterii na telefonach
    const now = Date.now();
    if (now - lastBroadcastTime < 33) return;
    lastBroadcastTime = now;

    // Pakujemy dane w format JSON dla data channel
    const message = { type: 'TELEMETRY', payload: data };
    
    connections.forEach(conn => {
      if (conn.open) {
        conn.send(message);
      }
    });
  },

  // Zatrzymanie sesji
  stopHost: () => {
    if (peer) {
      peer.destroy();
      peer = null;
    }
    connections = [];
    useSensorStore.getState().setSessionId(null);
    useSensorStore.getState().setViewerCount(0);
  },

  // --------- TRYB WIDZA (TELEFON) ---------
  
  initViewer: (hostId) => {
    return new Promise((resolve, reject) => {
      peer = new Peer({ debug: 2 });

      peer.on('open', () => {
        console.log('Łączenie z sesją:', hostId);
        hostConnection = peer.connect(hostId);
        
        hostConnection.on('open', () => {
          console.log('Połączono z hostem!');
          useSensorStore.getState().setIsGuestMode(true);
          resolve(true);
        });

        hostConnection.on('data', (msg) => {
          if (msg.type === 'TELEMETRY') {
            useSensorStore.getState().setSensorData(msg.payload);
          } else if (msg.type === 'INIT') {
            // Przejęcie konfiguracji modelu
            const state = useSensorStore.getState();
            // Można tu zaktualizować store
            // state.setMeshSensorMap(msg.payload.meshSensorMap); // to wymaga nowej akcji w store
            // na razie pomijamy pełną synchronizację modelu, chyba że dodamy akcje
          }
        });

        hostConnection.on('close', () => {
          console.log('Host zakończył sesję.');
          alert("Sesja została zakończona przez udostępniającego.");
          window.location.href = '/'; // Reset do strony głównej
        });
      });

      peer.on('error', (err) => {
        console.error('Błąd gościa PeerJS:', err);
        alert("Nie udało się połączyć. Sprawdź czy kod jest poprawny lub czy host nie zamknął sesji.");
        reject(err);
      });
    });
  }
};
