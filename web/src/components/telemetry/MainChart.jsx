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
  const { history, isRecording } = useSensorStore();

  // Konwersja danych na Newtony dla wykresu
  const chartData = history.map(point => ({
    ...point,
    sensor_A_N: gToN(point.sensor_A)
  }));

  // Ticki co 1 sekundę dla osi X
  const getXTicks = () => {
    if (history.length === 0) return [0];
    const maxTime = Math.ceil(history[history.length - 1].time || 0);
    return Array.from({ length: maxTime + 1 }, (_, i) => i);
  };

  return (
    <section className="bg-slate-50 relative overflow-hidden flex flex-col p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs uppercase font-bold text-brand-secondary tracking-widest">
          Dynamika Obciążenia (Newtony) {isRecording && <span className="text-red-500 animate-pulse ml-2">● LIVE</span>}
        </h3>
        <div className="flex items-center gap-4 text-[10px] font-bold text-brand-secondary">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-surface-border rounded-full shadow-sm">
            CZAS: <span className="text-brand-primary">{history.length > 0 ? history[history.length-1].time : 0}s</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-surface-border rounded-2xl shadow-sm p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
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
              domain={[0, 50]}
              ticks={[0, 10, 20, 30, 40, 50]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickMargin={10}
              label={{ value: 'Obciążenie [N]', angle: -90, position: 'left', offset: 0, fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              formatter={(value) => [`${value} N`, 'Obciążenie']}
              labelFormatter={(label) => `${label} sekunda`}
              cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="sensor_A_N" 
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
