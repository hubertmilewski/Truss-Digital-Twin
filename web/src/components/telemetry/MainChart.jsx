import { useSensorStore } from "../../store/useSensorStore";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function MainChart() {
  const history = useSensorStore(state => state.history);
  const isRecording = useSensorStore(state => state.isRecording);
  const isConnected = useSensorStore(state => state.isConnected);
  const displayUnit = useSensorStore(state => state.displayUnit);
  const setDisplayUnit = useSensorStore(state => state.setDisplayUnit);
  const sensors = useSensorStore(state => state.sensors);
  const toggleRecording = useSensorStore(state => state.toggleRecording);
  const isGuestMode = useSensorStore(state => state.isGuestMode);

  const isN = displayUnit === "N";
  const unitLabel = isN ? "N" : "g";
  const colors = [
    "#1D4ED8",
    "#DC2626",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
  ];
  const maxLoadN = useSensorStore(state => state.maxLoadN);
  const maxLoadG = maxLoadN * 100;

  const yDomain = isN ? [-maxLoadN, maxLoadN] : [-maxLoadG, maxLoadG];

  const getYTicks = () => {
    const max = isN ? maxLoadN : maxLoadG;
    const step = max / 5;
    const ticks = [];
    for (let i = -max; i <= max; i += step) {
      ticks.push(parseFloat(i.toFixed(1)));
    }
    return ticks;
  };
  
  const currentMaxTime =
    history.length > 0 ? history[history.length - 1].time : 0;
  const xDomainEnd = Math.max(10, Math.ceil(currentMaxTime + 1));

  const getXTicks = () => {
    
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

  
  const formatSessionTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    if (mins > 0) {
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${tenths}`;
    }
    return `${String(secs).padStart(2, "0")}.${tenths}`;
  };

  return (
    <section className="bg-surface relative overflow-hidden flex flex-col p-3 sm:p-6 min-h-0 lg:h-auto h-full">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-3">
        <h3 className="text-xs uppercase font-bold text-brand-secondary tracking-widest">
          Dynamika Obciążenia
        </h3>

        <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
          
          <div className="flex items-center h-8 sm:h-11 bg-brand-bg border border-surface-border rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setDisplayUnit("N")}
              className={`px-2 sm:px-4 h-full text-[9px] sm:text-xs font-bold tracking-wider transition-all duration-200 ${
                isN
                  ? "bg-brand-primary text-white shadow-inner"
                  : "text-brand-secondary hover:text-brand-text hover:bg-brand-bg"
              }`}
            >
              Niutony
            </button>
            <div className="w-px h-4 sm:h-5 bg-surface-border"></div>
            <button
              onClick={() => setDisplayUnit("g")}
              className={`px-2 sm:px-4 h-full text-[9px] sm:text-xs font-bold tracking-wider transition-all duration-200 ${
                !isN
                  ? "bg-brand-primary text-white shadow-inner"
                  : "text-brand-secondary hover:text-brand-text hover:bg-brand-bg"
              }`}
            >
              Gramy
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 h-8 sm:h-11 bg-brand-bg border border-surface-border rounded-lg shadow-sm">
            <span className="text-[8px] sm:text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Czas</span>
            <span className="text-[10px] sm:text-sm font-bold font-mono text-brand-text tabular-nums leading-none">
              {formatSessionTime(currentMaxTime)}
            </span>
            <span className="text-[8px] sm:text-[10px] font-bold text-brand-secondary">s</span>
          </div>
          
          {isConnected && !isGuestMode && (
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 sm:gap-3 px-3 sm:px-6 h-8 sm:h-11 rounded-lg text-[9px] sm:text-xs font-bold tracking-wider transition-all shadow-sm active:scale-95 ${
                isRecording
                  ? "bg-brand-accent text-white hover:bg-red-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <span className="leading-none">{isRecording ? "STOP" : "START"}</span>
            </button>
          )}

          {isGuestMode && (
            <div className={`flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-6 h-8 sm:h-11 rounded-lg text-[9px] sm:text-xs font-bold tracking-wider shadow-sm ${
              isRecording
                ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/30"
                : "bg-slate-100 text-slate-400 border border-slate-200"
            }`}>
              {isRecording ? (
                <><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-accent animate-pulse"></span> TRWA POMIAR</>
              ) : (
                "CZEKAM NA HOSTA"
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden min-h-[250px] sm:min-h-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart
            data={history.length > 0 ? history : [{ time: 0, _placeholder: 0 }]}
            margin={{ top: 16, right: 16, left: 8, bottom: 12 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={true}
              horizontal={true}
              stroke="#CBD5E1"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="time"
              type="number"
              domain={[0, xDomainEnd]}
              ticks={getXTicks()}
              axisLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
              tickLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
              tick={{ fontSize: 10, fill: "#64748B", fontWeight: 600, fontFamily: "Inter" }}
              tickMargin={6}
              label={{
                value: `Czas [s]`,
                position: "insideBottom",
                offset: -4,
                fontSize: 9,
                fill: "#94A3B8",
                fontWeight: 700,
              }}
            />
            <YAxis
              domain={yDomain}
              ticks={getYTicks()}
              allowDataOverflow={false}
              axisLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
              tickLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
              tick={{ fontSize: 10, fill: "#64748B", fontWeight: 600, fontFamily: "Inter" }}
              tickMargin={6}
              width={40}
              label={{
                value: `Obciążenie [${unitLabel}]`,
                angle: -90,
                position: "insideLeft",
                offset: 4,
                fontSize: 9,
                fill: "#94A3B8",
                fontWeight: 700,
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "11px",
                fontWeight: "600",
                fontFamily: "Inter",
                padding: "8px 12px",
                background: "#FFFFFF",
              }}
              formatter={(value, name) => [
                `${typeof value === "number" ? value.toFixed(2) : value} ${unitLabel}`,
                name,
              ]}
              labelFormatter={(label) => `Czas: ${label}s`}
              cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            
            <Line 
              type="monotone" 
              dataKey="_placeholder" 
              stroke="transparent" 
              strokeWidth={0} 
              dot={false} 
              activeDot={false}
              isAnimationActive={false}
            />
            {sensors.map((sensor, index) => (
              <Line
                key={sensor.id}
                type="monotone"
                dataKey={isN ? `${sensor.id}_N` : `${sensor.id}_g`}
                stroke={colors[index % colors.length]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
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
