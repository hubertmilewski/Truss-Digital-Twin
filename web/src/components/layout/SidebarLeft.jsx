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
            valueG={sensorData.sensor_A_g} 
            valueN={sensorData.sensor_A_N} 
          />
          {/* Mapowanie kolejnych czujników */}
        </div>
      </section>
    </aside>
  );
}

export default SidebarLeft;
