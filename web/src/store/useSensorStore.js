import { create } from 'zustand'

export const useSensorStore = create((set, get) => ({
  // Aktualny odczyt
  sensorData: {},
  sensors: [], // Lista czujników z Raspberry: [{id: 'sensor_A', label: 'Belka (A)'}, ...]
  
  // Historia odczytów w aktywnej sesji
  history: [],
  
  isConnected: false,
  isSignalLost: false,
  connectionError: null,
  connectionStartTime: null,
  isRecording: false,
  startTime: null,
  displayUnit: 'N', // Domyślnie Niutony
  extremeValues: {
    max: null, // { valueG, valueN, sensor, time }
    min: null,
  },
  
  setDisplayUnit: (unit) => set({ displayUnit: unit }),
  setSignalLost: (status) => set({ isSignalLost: status }),
  setSensors: (sensors) => set({ sensors }),
  setConnectionError: (error) => set({ connectionError: error }),
  
  // Aktualizacja danych + opcjonalne dodawanie do historii
  setSensorData: (newData) => set((state) => {
    // Jeśli to paczka konfiguracyjna
    if (newData.type === 'config') {
      return { sensors: newData.sensors };
    }

    const normalizedData = { ...newData };
    const updatedSensorData = { ...state.sensorData, ...normalizedData };
    
    if (!state.isRecording) {
      return { sensorData: updatedSensorData };
    }

    const currentTime = new Date().getTime();
    const relativeTime = parseFloat(((currentTime - state.startTime) / 1000).toFixed(1));

    // Szukamy ekstremów w nowej paczce danych
    let newMax = state.extremeValues.max;
    let newMin = state.extremeValues.min;

    // Przeszukujemy klucze kończące się na _g (gramy)
    Object.keys(normalizedData).forEach(key => {
      if (key.endsWith('_g')) {
        const sensorId = key.replace('_g', '').replace('sensor_', '');
        const valG = normalizedData[key];
        const valN = normalizedData[key.replace('_g', '_N')] || 0;

        if (!newMax || valG > newMax.valueG) {
          newMax = { valueG: valG, valueN: valN, sensor: sensorId, time: relativeTime };
        }
        if (!newMin || valG < newMin.valueG) {
          newMin = { valueG: valG, valueN: valN, sensor: sensorId, time: relativeTime };
        }
      }
    });

    const newEntry = {
      ...normalizedData,
      time: relativeTime,
      timestamp: `${relativeTime}s`
    };

    return {
      sensorData: updatedSensorData,
      extremeValues: { max: newMax, min: newMin },
      history: [...state.history, newEntry].slice(-50000)
    };
  }),

  // Przełączanie nagrywania
  toggleRecording: () => set((state) => {
    const switchingOn = !state.isRecording;
    
    return {
      isRecording: switchingOn,
      startTime: switchingOn ? new Date().getTime() : state.startTime,
      history: switchingOn ? [] : state.history,
      extremeValues: switchingOn ? { max: null, min: null } : state.extremeValues
    };
  }),
  
  resetHistory: () => set({ history: [] }),
  resetData: () => set({
    sensorData: { sensor_A_g: 0, sensor_A_N: 0 },
    history: [],
    startTime: null,
    isRecording: false,
    extremeValues: { max: null, min: null }
  }),
  setIsConnected: (status) => set({ 
    isConnected: status,
    connectionStartTime: status ? new Date().getTime() : null 
  }),
}))