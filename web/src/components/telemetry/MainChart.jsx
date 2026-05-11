import { useSensorStore } from "../../store/useSensorStore";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

function MainChart() {
  const { history, isRecording, displayUnit, setDisplayUnit, sensors } = useSensorStore();

  const isN = displayUnit === 'N';
  const unitLabel = isN ? 'N' : 'g';
  const colors = ['var(--color-brand-primary)', 'var(--color-brand-accent)', '#10b981', '#f59e0b', '#8b5cf6'];
  const yDomain = isN ? [0, 10] : [0, 1000];
  const yTicks = isN ? [0, 2, 4, 6, 8, 10] : [0, 200, 400, 600, 800, 1000];

  // Parametry osi X
  const currentMaxTime = history.length > 0 ? history[history.length - 1].time : 0;
  const xDomainEnd = Math.max(10, Math.ceil(currentMaxTime + 1));
  
  const getXTicks = () => {
    // Obliczamy interwał tak, aby zawsze było około 10-20 ticków
    let interval = 2;
    if (xDomainEnd > 60) interval = 5;
    if (xDomainEnd > 120) interval = 10;
    if (xDomainEnd > 300) interval = 30;
    if (xDomainEnd > 600) interval = 60;
    if (xDomainEnd > 1800) interval = 300;

    const ticks = [];
    for (let i = 0; i <= xDomainEnd; i += interval) {
      ticks.push(i);
    }
    return ticks;
  };

  return (
    <section className="bg-slate-50 relative overflow-hidden flex flex-col p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h3 className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-brand-secondary'} text-xs uppercase font-bold tracking-widest flex items-center`}>
            Dynamika Obciążenia
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Jednostka: {isN ? 'Niutony' : 'Gramy'}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white border border-surface-border rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setDisplayUnit('N')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${isN ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-secondary hover:bg-slate-50'}`}
            >
              N
            </button>
            <button 
              onClick={() => setDisplayUnit('g')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!isN ? 'bg-brand-primary text-white shadow-sm' : 'text-brand-secondary hover:bg-slate-50'}`}
            >
              g
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-surface-border rounded-lg shadow-sm text-[10px] font-bold text-brand-secondary">
            CZAS: <span className="text-brand-primary font-mono">{currentMaxTime}s</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-surface-border rounded-2xl shadow-sm p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.length > 0 ? history : [{ time: 0 }]} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              type="number"
              domain={[0, xDomainEnd]}
              ticks={getXTicks()}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickMargin={10}
              label={{ value: 'Sekundy [s]', position: 'bottom', offset: 0, fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
            />
            <YAxis 
              domain={yDomain}
              ticks={yTicks}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickMargin={10}
              label={{ value: `Obciążenie [${unitLabel}]`, angle: -90, position: 'left', offset: 0, fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              formatter={(value) => [`${value} ${unitLabel}`, 'Obciążenie']}
              labelFormatter={(label) => `${label} sekunda`}
              cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
            />
            {sensors.map((sensor, index) => (
              <Line 
                key={sensor.id}
                type="monotone" 
                dataKey={isN ? `${sensor.id}_N` : `${sensor.id}_g`} 
                stroke={colors[index % colors.length]} 
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
                connectNulls={true}
                name={sensor.label}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default MainChart;
