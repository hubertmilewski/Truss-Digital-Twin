import { useSensorStore } from "../../store/useSensorStore";
import { gToN } from "../../utils/converters";
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
  const { history, isRecording, displayUnit, setDisplayUnit } = useSensorStore();

  const isN = displayUnit === 'N';
  const dataKey = isN ? 'sensor_A_N' : 'sensor_A_g';
  const unitLabel = isN ? 'N' : 'g';
  const yDomain = isN ? [0, 50] : [0, 5000];
  const yTicks = isN ? [0, 10, 20, 30, 40, 50] : [0, 1000, 2000, 3000, 4000, 5000];

  // Ticki co 1 sekundę dla osi X
  const getXTicks = () => {
    if (history.length === 0) return [0];
    const maxTime = Math.ceil(history[history.length - 1].time || 0);
    return Array.from({ length: maxTime + 1 }, (_, i) => i);
  };

  return (
    <section className="bg-slate-50 relative overflow-hidden flex flex-col p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-1">
          <h3 className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-brand-secondary'} text-xs uppercase font-bold text-brand-secondary tracking-widest flex items-center`}>
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
            CZAS: <span className="text-brand-primary font-mono">{history.length > 0 ? history[history.length-1].time : 0}s</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-surface-border rounded-2xl shadow-sm p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              type="number"
              domain={[0, 'dataMax + 1']}
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
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="var(--color-brand-primary)" 
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default MainChart;
