import { useSensorStore } from "../../store/useSensorStore";
import SensorCard from "../telemetry/SensorCard";

function SidebarLeft() {
  const { sensorData, extremeValues, displayUnit, sensors, isConnected, maxLoadN } =
    useSensorStore();

  const isN = displayUnit === "N";

  return (
    <aside className="bg-surface lg:border-r border-surface-border p-3 flex flex-col gap-4 overflow-y-auto">
      <section>
        <h3 className="text-[10px] uppercase font-bold text-brand-secondary mb-2 tracking-widest">
          Telemetria na żywo
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {sensors.length > 0 ? (
            sensors.map((sensor) => (
              <SensorCard
                key={sensor.id}
                label={sensor.label}
                valueG={sensorData[`${sensor.id}_g`] || 0}
                valueN={sensorData[`${sensor.id}_N`] || 0}
                maxLoadN={maxLoadN}
              />
            ))
          ) : (
            <div className="col-span-full text-[9px] text-slate-400 italic text-center py-2 border border-dashed border-surface-border rounded-lg">
              {isConnected ? "Oczekiwanie na dane..." : "Oczekiwanie..."}
            </div>
          )}
        </div>
      </section>

      <section className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-[10px] uppercase font-bold text-brand-secondary mb-2 tracking-widest shrink-0">
          Ekstrema Badania
        </h3>
        <div className="bg-surface border border-surface-border rounded-lg overflow-y-auto">
          {sensors.length > 0 ? (
            <div className="flex flex-col divide-y divide-surface-border">
              {sensors.map((sensor) => {
                const exts = extremeValues[sensor.id];
                const shortLabel =
                  sensor.label
                    .replace("Belka", "")
                    .replace(/[()]/g, "")
                    .trim() || sensor.id;

                return (
                  <div
                    key={sensor.id}
                    className="px-3 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-brand-secondary uppercase w-6 shrink-0">
                      {shortLabel}
                    </span>

                    <div className="flex gap-3 sm:gap-4 items-center flex-1 justify-end">

                      <div className="flex flex-col items-end w-[85px] sm:w-[95px]">
                        {exts?.min ? (
                          <div className="text-right leading-none">
                            <div className="flex items-baseline justify-end">
                              <span className="text-[10px] font-bold text-emerald-600/70 uppercase mr-1.5">
                                Min:
                              </span>
                              <span className="text-sm font-bold font-mono text-emerald-600">
                                {isN
                                  ? exts.min.valueN.toFixed(1)
                                  : exts.min.valueG.toFixed(0)}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 ml-0.5">
                                {isN ? "N" : "g"}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1">
                              {exts.min.time}s
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-end">
                            <span className="text-[10px] font-bold text-emerald-600/70 uppercase mr-1.5">
                              Min:
                            </span>
                            <span className="text-[10px] text-slate-400 italic">
                              --
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end w-[85px] sm:w-[95px]">
                        {exts?.max ? (
                          <div className="text-right leading-none">
                            <div className="flex items-baseline justify-end">
                              <span className="text-[10px] font-bold text-brand-accent/70 uppercase mr-1.5">
                                Max:
                              </span>
                              <span className="text-sm font-bold font-mono text-brand-accent">
                                {isN
                                  ? exts.max.valueN.toFixed(1)
                                  : exts.max.valueG.toFixed(0)}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 ml-0.5">
                                {isN ? "N" : "g"}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-1">
                              {exts.max.time}s
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-end">
                            <span className="text-[10px] font-bold text-brand-accent/70 uppercase mr-1.5">
                              Max:
                            </span>
                            <span className="text-[10px] text-slate-400 italic">
                              --
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[9px] text-slate-400 italic text-center py-2">
              Brak danych...
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}

export default SidebarLeft;
