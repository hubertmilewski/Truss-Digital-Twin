import { create } from 'zustand'

export const useSensorStore = create((set) => ({
  // Domyślne wartości czujników (gramy)
  sensorData: {
    sensor_A: 0,
  },
  isConnected: false,
  
  // Funkcja aktualizująca stan na podstawie nowej paczki JSON z Pico
  setSensorData: (newData) => set((state) => ({
    sensorData: { ...state.sensorData, ...newData }
  })),
  
  setIsConnected: (status) => set({ isConnected: status }),
}))