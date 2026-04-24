import { useSensorStore } from '../store/useSensorStore';

let port;
let reader;

export const connectSerial = async () => {
  try {
    // Prosi użytkownika o wybranie portu COM
    port = await navigator.serial.requestPort();
    
    // Pico standardowo działa świetnie na 115200 baud
    await port.open({ baudRate: 115200 }); 
    
    useSensorStore.getState().setIsConnected(true);
    readLoop();
  } catch (error) {
    console.error("Nie udało się połączyć z portem szeregowym:", error);
  }
};

const readLoop = async () => {
  const textDecoder = new TextDecoderStream();
  port.readable.pipeTo(textDecoder.writable);
  reader = textDecoder.readable.getReader();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      reader.releaseLock();
      break;
    }
    
    if (value) {
      buffer += value;
      // Dzielimy po znaku nowej linii (Pico wysyła \n na końcu każdego print)
      const lines = buffer.split('\n');
      
      // Ostatni element zostawiamy w buforze, bo może być niekompletny
      buffer = lines.pop(); 

      for (const line of lines) {
        const trimmed = line.trim();
        // Weryfikacja, czy to na pewno wygląda jak JSON
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsedData = JSON.parse(trimmed);
            // Wysyłamy prosto do RAM (Zustand)
            useSensorStore.getState().setSensorData(parsedData);
          } catch {
            console.warn("Zignorowano uszkodzoną paczkę danych:", trimmed);
          }
        }
      }
    }
  }
};