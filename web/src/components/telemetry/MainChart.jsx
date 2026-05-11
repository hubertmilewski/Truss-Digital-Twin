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
  const { history, isRecording, isConnected, displayUnit, setDisplayUnit, sensors, toggleRecording } =
    useSensorStore();

  const isN = displayUnit === "N";
  const unitLabel = isN ? "N" : "g";
  const colors = [
    "#1D4ED8",
    "#DC2626",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
  ];
  const yDomain = isN ? [0, 10] : [0, 1000];
  const yTicks = isN ? [0, 2, 4, 6, 8, 10] : [0, 200, 400, 600, 800, 1000];

  // Parametry osi X
  const currentMaxTime =
    history.length > 0 ? history[history.length - 1].time : 0;
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

  // Formatowanie czasu sesji do MM:SS
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
    <section className="bg-brand-bg relative overflow-hidden flex flex-col p-3 sm:p-6 min-h-0 lg:h-auto h-full">
      {/* Nagłówek sekcji */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3">
        <h3 className="text-xs uppercase font-bold text-brand-secondary tracking-widest">
          Dynamika Obciążenia
        </h3>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Przełącznik jednostek */}
          <div className="flex items-center h-9 sm:h-11 bg-surface border border-surface-border rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setDisplayUnit("N")}
              className={`px-3 sm:px-4 h-full text-[10px] sm:text-xs font-bold tracking-wider transition-all duration-200 ${
                isN
                  ? "bg-brand-primary text-white shadow-inner"
                  : "text-brand-secondary hover:text-brand-text hover:bg-brand-bg"
              }`}
            >
              Niutony
            </button>
            <div className="w-px h-5 bg-surface-border"></div>
            <button
              onClick={() => setDisplayUnit("g")}
              className={`px-3 sm:px-4 h-full text-[10px] sm:text-xs font-bold tracking-wider transition-all duration-200 ${
                !isN
                  ? "bg-brand-primary text-white shadow-inner"
                  : "text-brand-secondary hover:text-brand-text hover:bg-brand-bg"
              }`}
            >
              Gramy
            </button>
          </div>

          {/* Wyświetlacz czasu sesji */}
          <div className="flex items-center gap-2 px-3 sm:px-4 h-9 sm:h-11 bg-surface border border-surface-border rounded-lg shadow-sm">
            <span className="text-[9px] sm:text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Czas</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-brand-text tabular-nums leading-none">
              {formatSessionTime(currentMaxTime)}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-brand-secondary">s</span>
          </div>

          {/* Przycisk START/STOP POMIAR */}
          {isConnected && (
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 h-9 sm:h-11 rounded-lg text-[10px] sm:text-xs font-bold tracking-wider transition-all shadow-sm active:scale-95 ${
                isRecording
                  ? "bg-brand-accent text-white hover:bg-red-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-white shrink-0 ${isRecording ? "animate-pulse" : ""}`}></span>
              <span className="leading-none">{isRecording ? "STOP" : "START"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Kontener wykresu */}
      <div className="flex-1 bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden min-h-[250px] sm:min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={history.length > 0 ? history : [{ time: 0, _placeholder: 0 }]}
            margin={{ top: 16, right: 16, left: 32, bottom: 12 }}
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
              ticks={yTicks}
              allowDataOverflow={false}
              axisLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
              tickLine={{ stroke: "#CBD5E1", strokeWidth: 1 }}
              tick={{ fontSize: 10, fill: "#64748B", fontWeight: 600, fontFamily: "Inter" }}
              tickMargin={6}
              width={60}
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
            {/* Ukryta linia kotwicząca oś Y, gdy nie ma danych */}
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
