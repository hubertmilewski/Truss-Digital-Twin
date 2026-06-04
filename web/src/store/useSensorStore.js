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
  displayUnit: 'N',
  extremeValues: {}, // format: { 'sensor_A': { max: { valueG, valueN, time }, min: { valueG, valueN, time } } }
  customModelUrl: null,
  
  // Konfiguracja sprzętu i tutorialu
  maxLoadN: 10, // Domyślnie 10 N
  tutorialCompleted: localStorage.getItem('pb_tutorial') === 'true',
  
  setMaxLoadN: (val) => set({ maxLoadN: val }),
  completeTutorial: () => {
    localStorage.setItem('pb_tutorial', 'true');
    set({ tutorialCompleted: true });
  },
  resetTutorial: () => {
    localStorage.removeItem('pb_tutorial');
    set({ tutorialCompleted: false });
  },
  
  setDisplayUnit: (unit) => set({ displayUnit: unit }),
  setSignalLost: (status) => set({ isSignalLost: status }),
  setSensors: (sensors) => set({ sensors }),
  setConnectionError: (error) => set({ connectionError: error }),
  setCustomModelUrl: (url) => set({ customModelUrl: url }),
  
  // Aktualizacja danych + opcjonalne dodawanie do historii
  setSensorData: (newData) => set((state) => {
    // Jeśli to paczka konfiguracyjna
    if (newData.type === 'config') {
      return { sensors: newData.sensors };
    }

    const normalizedData = { ...newData };
    const updatedSensorData = { ...state.sensorData, ...normalizedData };
    
    // dynamiczne wykrywanie czujników w przypadku utraty paczki konfiguracyjnej
    const newSensors = [...state.sensors];
    let sensorsChanged = false;

    Object.keys(normalizedData).forEach(key => {
      if (key.endsWith('_g')) {
        const fullSensorId = key.replace('_g', ''); // np. 'sensor_A'
        const shortId = fullSensorId.replace('sensor_', ''); // np. 'A'
        
        if (!newSensors.find(s => s.id === fullSensorId)) {
          newSensors.push({ id: fullSensorId, label: `Belka (${shortId})` });
          sensorsChanged = true;
        }
      }
    });
    
    if (!state.isRecording) {
      return { 
        sensorData: updatedSensorData,
        ...(sensorsChanged ? { sensors: newSensors } : {})
      };
    }

    const currentTime = new Date().getTime();
    const relativeTime = parseFloat(((currentTime - state.startTime) / 1000).toFixed(1));

    // Szukamy ekstremów w nowej paczce danych
    let newExtremeValues = { ...state.extremeValues };

    // Przeszukujemy klucze kończące się na _g (gramy)
    Object.keys(normalizedData).forEach(key => {
      if (key.endsWith('_g')) {
        const fullSensorId = key.replace('_g', ''); // np. 'sensor_A'
        const valG = normalizedData[key];
        const valN = normalizedData[key.replace('_g', '_N')] || 0;

        if (!newExtremeValues[fullSensorId]) {
          newExtremeValues[fullSensorId] = { max: null, min: null };
        }

        const currentExt = newExtremeValues[fullSensorId];

        if (!currentExt.max || valG > currentExt.max.valueG) {
          currentExt.max = { valueG: valG, valueN: valN, time: relativeTime };
        }
        if (!currentExt.min || valG < currentExt.min.valueG) {
          currentExt.min = { valueG: valG, valueN: valN, time: relativeTime };
        }
      }
    });

    const newEntry = {
      ...updatedSensorData,
      time: relativeTime,
      timestamp: `${relativeTime}s`
    };

    return {
      sensorData: updatedSensorData,
      extremeValues: newExtremeValues,
      history: [...state.history, newEntry].slice(-50000),
      ...(sensorsChanged ? { sensors: newSensors } : {})
    };
  }),

  // Przełączanie nagrywania
  toggleRecording: () => set((state) => {
    const switchingOn = !state.isRecording;
    
    return {
      isRecording: switchingOn,
      startTime: switchingOn ? new Date().getTime() : state.startTime,
      history: switchingOn ? [] : state.history,
      extremeValues: switchingOn ? {} : state.extremeValues
    };
  }),
  
  resetHistory: () => set({ history: [] }),
  resetData: () => set({
    sensorData: { sensor_A_g: 0, sensor_A_N: 0 },
    history: [],
    startTime: null,
    isRecording: false,
    extremeValues: {}
  }),
  setIsConnected: (status) => set({ 
    isConnected: status,
    connectionStartTime: status ? new Date().getTime() : null 
  }),
}))