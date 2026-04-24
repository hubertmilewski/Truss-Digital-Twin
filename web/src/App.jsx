import { useSensorStore } from './store/useSensorStore';
import { connectSerial } from './utils/serialManager';

function App() {
  const { sensorData, isConnected } = useSensorStore();

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '2rem', color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header roboczy */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h2>Digital Twin: Monitor</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 'bold' }}>
            Status: {isConnected ? <span style={{ color: '#10B981' }}>Połączono</span> : <span style={{ color: '#DC2626' }}>Brak połączenia</span>}
          </span>
          {!isConnected && (
            <button 
              onClick={connectSerial}
              style={{ backgroundColor: '#1D4ED8', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Podłącz Pico (USB)
            </button>
          )}
        </div>
      </div>

      {/* Kontener na odczyty z czujników */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        
        {/* Przykładowa robocza karta czujnika */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#94A3B8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Sensor A (Główny Węzeł)</h3>
          <div style={{ 
            fontFamily: '"JetBrains Mono", monospace', 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: sensorData.sensor_A > 4500 ? '#DC2626' : '#1D4ED8' 
          }}>
            {sensorData.sensor_A} g
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;