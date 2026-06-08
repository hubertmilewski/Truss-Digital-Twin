import { create } from 'zustand'
import { initIndexedDB, saveToIndexedDB, saveBulkToIndexedDB, getAllFromIndexedDB } from '../utils/indexedDBManager'

initIndexedDB().catch(err => console.error('Błąd inicjalizacji IndexedDB:', err))

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
  
  localRecordingId: localStorage.getItem('pb_recording_id') || null,
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

  startRecording: () => {
    const newRecordingId = `rec_${Date.now()}`;
    localStorage.setItem('pb_recording_id', newRecordingId);
    set({
      isRecording: true,
      startTime: new Date().getTime(),
      history: [],
      extremeValues: {},
      localRecordingId: newRecordingId
    });
  },

  stopRecording: () => {
    const { history, localRecordingId } = useSensorStore.getState();
    if (history.length > 0 && localRecordingId) {
      saveBulkToIndexedDB(history, localRecordingId).catch(err =>
        console.warn('Błąd zapisu końcowej historii do IndexedDB:', err)
      );
    }
    set({ isRecording: false });
  },
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
        const fullSensorId = key.replace('_g', '');
        const shortId = fullSensorId.replace('sensor_', ''); 
        
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
        const fullSensorId = key.replace('_g', '');
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

    // Ring Buffer - przechowuj ostatnie 120s (~2400 punktów przy 20 Hz)
    const MAX_HISTORY_LENGTH = 2400;
    const newHistory = [...state.history, newEntry];
    
    // Archiwizuj najstarsze dane do IndexedDB jeśli przekroczysz limit
    if (newHistory.length > MAX_HISTORY_LENGTH && state.isRecording) {
      const dataToArchive = newHistory[0];
      saveToIndexedDB(dataToArchive, state.localRecordingId || 'default').catch(err =>
        console.warn('Błąd archiwizacji do IndexedDB:', err)
      );
    }

    const finalHistory = newHistory.slice(-MAX_HISTORY_LENGTH);

    return {
      sensorData: updatedSensorData,
      extremeValues: newExtremeValues,
      history: finalHistory,
      ...(sensorsChanged ? { sensors: newSensors } : {})
    };
  }),

  
  loadLastSession: async () => {
    const recordingId = localStorage.getItem('pb_recording_id');
    if (!recordingId) return;
    try {
      const data = await getAllFromIndexedDB(recordingId);
      if (data && data.length > 0) {
        set({ history: data, localRecordingId: recordingId });
      }
    } catch (err) {
      console.warn('Błąd wczytywania ostatniej sesji z IndexedDB:', err);
    }
  },

  toggleRecording: () => {
    const state = useSensorStore.getState();
    const switchingOn = !state.isRecording;
    if (switchingOn) {
      useSensorStore.getState().startRecording();
    } else {
      useSensorStore.getState().stopRecording();
    }
  },
  

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