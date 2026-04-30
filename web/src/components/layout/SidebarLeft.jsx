import { useSensorStore } from "../../store/useSensorStore";
import SensorCard from "../telemetry/SensorCard";

function SidebarLeft() {
  const { sensorData, extremeValues, displayUnit } = useSensorStore();

  const isN = displayUnit === 'N';

  const renderExtreme = (type, data) => {
    if (!data) return (
      <div className="text-[10px] text-slate-400 italic">Brak danych...</div>
    );

    return (
      <div className="bg-brand-bg/50 border border-surface-border rounded-lg p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-brand-secondary uppercase">{type === 'max' ? 'Maksimum' : 'Minimum'}</span>
          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Czujnik {data.sensor}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold font-mono ${type === 'max' ? 'text-brand-accent' : 'text-emerald-600'}`}>
            {isN ? data.valueN.toFixed(2) : data.valueG.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold text-brand-secondary uppercase">{isN ? 'N' : 'g'}</span>
        </div>
        <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
          Moment: <span className="text-brand-primary">{data.time}s</span>
        </div>
      </div>
    );
  };

  return (
    <aside className="bg-surface border-r border-surface-border p-6 flex flex-col gap-8 overflow-y-auto">
      <section>
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-5 tracking-widest">Telemetria na żywo</h3>
        <div className="flex flex-col gap-4">
          <SensorCard 
            label="Belka A-1" 
            valueG={sensorData.sensor_A_g} 
            valueN={sensorData.sensor_A_N} 
          />
          {/* Mapowanie kolejnych czujników */}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-5 tracking-widest">Ekstrema Badania</h3>
        <div className="flex flex-col gap-3">
          {renderExtreme('max', extremeValues.max)}
          {renderExtreme('min', extremeValues.min)}
        </div>
      </section>
    </aside>
  );
}

export default SidebarLeft;
