import { useSensorStore } from "../../store/useSensorStore";
import SensorCard from "../telemetry/SensorCard";

function SidebarLeft() {
  const { sensorData } = useSensorStore();

  return (
    <aside className="bg-surface border-r border-surface-border p-6 flex flex-col gap-8 overflow-y-auto">
      <section>
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-5 tracking-widest">Telemetria na żywo</h3>
        <div className="flex flex-col gap-4">
          <SensorCard 
            label="Belka A-1" 
            value={sensorData.sensor_A} 
          />
          {/* Mapowanie kolejnych czujników */}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-5 tracking-widest">Informacje o sesji</h3>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-secondary">Czas pracy</span>
            <span className="font-mono font-bold">00:12:44</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-secondary">Częstotliwość</span>
            <span className="font-mono font-bold">60Hz</span>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default SidebarLeft;
