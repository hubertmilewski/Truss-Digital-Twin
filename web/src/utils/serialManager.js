import { useSensorStore } from '../store/useSensorStore';

let port;
let reader;
let watchdogTimer;

const startWatchdog = () => {
  stopWatchdog();
  watchdogTimer = setTimeout(() => {
    useSensorStore.getState().setSignalLost(true);
  }, 3000); // 3 sekundy bez danych = utrata sygnału
};

const stopWatchdog = () => {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
};

export const connectSerial = async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 }); 
    
    useSensorStore.getState().setIsConnected(true);
    useSensorStore.getState().setSignalLost(false);
    readLoop();
  } catch (error) {
    console.error("Nie udało się połączyć z portem szeregowym:", error);
  }
};

export const disconnectSerial = async () => {
  try {
    if (reader) {
      // Anulowanie readera przerywa pętlę readLoop (zwraca done: true)
      await reader.cancel();
    } else {
      // Awaryjne czyszczenie jeśli reader nie istnieje
      cleanupConnection();
    }
  } catch (error) {
    console.error("Błąd podczas anulowania odczytu:", error);
    cleanupConnection();
  }
};

// Funkcja pomocnicza do czyszczenia stanu
const cleanupConnection = () => {
  useSensorStore.getState().setIsConnected(false);
  useSensorStore.getState().setSignalLost(false);
  useSensorStore.getState().resetData();
};

const readLoop = async () => {
  const textDecoder = new TextDecoderStream();
  const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
  reader = textDecoder.readable.getReader();

  let buffer = "";
  startWatchdog();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      if (value) {
        // Resetujemy watchdog przy każdym otrzymanym fragmencie danych
        useSensorStore.getState().setSignalLost(false);
        startWatchdog();

        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop(); 

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              const parsedData = JSON.parse(trimmed);
              useSensorStore.getState().setSensorData(parsedData);
            } catch {
              console.warn("Zignorowano uszkodzoną paczkę danych:", trimmed);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Błąd odczytu z portu szeregowego:", error);
  } finally {
    if (reader) {
      try {
        reader.releaseLock();
      } catch (e) {
        console.error("Błąd podczas zwalniania blokady:", e);
      }
      reader = null;
    }
    
    if (port) {
      try {
        await port.close();
      } catch (e) {
        // Port może być już niedostępny fizycznie, ignorujemy błąd
      }
      port = null;
    }
    
    stopWatchdog();
    cleanupConnection();
  }
};