import { create } from 'zustand'

export const useSensorStore = create((set, get) => ({
  // Aktualny odczyt (zawsze aktualizowany)
  sensorData: {
    sensor_A: 0,
  },
  
  // Historia odczytów w aktywnej sesji
  history: [],
  
  isConnected: false,
  isRecording: false,
  startTime: null,
  
  // Aktualizacja danych + opcjonalne dodawanie do historii
  setSensorData: (newData) => set((state) => {
    const updatedSensorData = { ...state.sensorData, ...newData };
    
    // Jeśli nie nagrywamy, tylko aktualizujemy bieżące wartości
    if (!state.isRecording) {
      return { sensorData: updatedSensorData };
    }

    // Obliczamy względny czas w sekundach od momentu startu
    const currentTime = new Date().getTime();
    const relativeTime = ((currentTime - state.startTime) / 1000).toFixed(1);

    const newEntry = {
      ...newData,
      time: parseFloat(relativeTime), // Sekundy jako liczba dla osi X
      timestamp: `${relativeTime}s` // Czytelny label
    };

    return {
      sensorData: updatedSensorData,
      history: [...state.history, newEntry].slice(-500) // Zwiększony limit dla lepszej perspektywy czasowej
    };
  }),

  // Przełączanie nagrywania
  toggleRecording: () => set((state) => {
    const switchingOn = !state.isRecording;
    
    return {
      isRecording: switchingOn,
      // Jeśli zaczynamy nową sesję, resetujemy historię i ustawiamy punkt zero
      startTime: switchingOn ? new Date().getTime() : state.startTime,
      history: switchingOn ? [] : state.history
    };
  }),
  
  resetHistory: () => set({ history: [] }),
  setIsConnected: (status) => set({ isConnected: status }),
}))