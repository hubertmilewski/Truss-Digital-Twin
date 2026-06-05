import { create } from 'zustand'

export const useSensorStore = create((set, get) => ({
  
  sensorData: {},
  sensors: [], 
  
  
  history: [],
  
  isConnected: false,
  isSignalLost: false,
  connectionError: null,
  connectionStartTime: null,
  isRecording: false,
  startTime: null,
  displayUnit: 'N',
  extremeValues: {}, 
  customModelUrl: null,
  meshSensorMap: JSON.parse(localStorage.getItem('pb_mesh_mapping') || '{}'),
  
  
  maxLoadN: 10, 
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

  setConnectionError: (error) => set({ connectionError: error }),
  setCustomModelUrl: (url) => set({ customModelUrl: url }),
  
  
  sessionId: null,
  viewerCount: 0,
  isGuestMode: false,
  
  setSessionId: (id) => set({ sessionId: id }),
  setViewerCount: (count) => set({ viewerCount: count }),
  setIsGuestMode: (status) => set({ isGuestMode: status }),
  
  syncGuestConfig: (config) => set((state) => ({
    meshSensorMap: config.meshSensorMap || state.meshSensorMap,
    maxLoadN: config.maxLoadN || state.maxLoadN,
    displayUnit: config.displayUnit || state.displayUnit,
    history: config.history || state.history,
    sensorData: config.sensorData || state.sensorData,
    extremeValues: config.extremeValues || state.extremeValues,
    startTime: config.isRecording ? (new Date().getTime() - (config.history.length > 0 ? parseFloat(config.history[config.history.length-1].time)*1000 : 0)) : state.startTime,
    isRecording: config.isRecording || false
  })),

  startRecording: () => set({
    isRecording: true,
    startTime: new Date().getTime(),
    history: [],
    extremeValues: {}
  }),

  stopRecording: () => set({
    isRecording: false
  }),
  setMeshSensorMapping: (meshId, sensorId) => set((state) => {
    const newMap = { ...state.meshSensorMap };
    
    Object.keys(newMap).forEach(key => {
      if (newMap[key] === sensorId) delete newMap[key];
    });
    
    if (sensorId) {
      newMap[meshId] = sensorId;
    } else {
      delete newMap[meshId];
    }
    
    
    localStorage.setItem('pb_mesh_mapping', JSON.stringify(newMap));
    
    return { meshSensorMap: newMap };
  }),
  
  
  setSensorData: (newData) => set((state) => {
    
    if (newData.type === 'config') {
      return { sensors: newData.sensors };
    }

    const normalizedData = { ...newData };
    const updatedSensorData = { ...state.sensorData, ...normalizedData };
    
    
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

    
    let newExtremeValues = { ...state.extremeValues };

    
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

  
  toggleRecording: () => set((state) => {
    const switchingOn = !state.isRecording;
    
    return {
      isRecording: switchingOn,
      startTime: switchingOn ? new Date().getTime() : state.startTime,
      history: switchingOn ? [] : state.history,
      extremeValues: switchingOn ? {} : state.extremeValues
    };
  }),
  

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