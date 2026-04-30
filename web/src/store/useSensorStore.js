import { create } from 'zustand'

export const useSensorStore = create((set, get) => ({
  // Aktualny odczyt (zawsze aktualizowany)
  sensorData: {
    sensor_A_g: 0,
    sensor_A_N: 0,
  },
  
  // Historia odczytów w aktywnej sesji
  history: [],
  
  isConnected: false,
  connectionStartTime: null,
  isRecording: false,
  startTime: null,
  displayUnit: 'N', // Domyślnie Niutony
  
  setDisplayUnit: (unit) => set({ displayUnit: unit }),
  
  // Aktualizacja danych + opcjonalne dodawanie do historii
  setSensorData: (newData) => set((state) => {
    // Mapujemy stare klucze na nowe jeśli przyjdą (dla kompatybilności wstecznej)
    const normalizedData = { ...newData };
    if (newData.sensor_A !== undefined) normalizedData.sensor_A_g = newData.sensor_A;
    
    const updatedSensorData = { ...state.sensorData, ...normalizedData };
    
    // Jeśli nie nagrywamy, tylko aktualizujemy bieżące wartości
    if (!state.isRecording) {
      return { sensorData: updatedSensorData };
    }

    // Obliczamy względny czas w sekundach od momentu startu
    const currentTime = new Date().getTime();
    const relativeTime = ((currentTime - state.startTime) / 1000).toFixed(1);

    const newEntry = {
      ...normalizedData,
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
  setIsConnected: (status) => set({ 
    isConnected: status,
    connectionStartTime: status ? new Date().getTime() : null 
  }),
}))