function SensorCard({ label, valueG = 0, valueN = 0, maxLoadN = 10 }) {
  const loadPercentage = Math.min((valueN / maxLoadN) * 100, 100);
  const isOverloaded = valueN > maxLoadN * 0.8;

  return (
    <div className="bg-brand-bg border border-surface-border p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
          {label}
        </label>
        <div className="text-[10px] font-bold text-brand-secondary/60 font-mono">
          {valueG.toFixed(0)}g
        </div>
      </div>
      <div className="text-4xl font-bold text-brand-primary mb-3 font-mono flex items-baseline">
        {valueN.toFixed(2)}
        <span className="text-sm font-normal text-brand-secondary ml-1">N</span>
      </div>
      <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${loadPercentage}%`,
            backgroundColor: isOverloaded
              ? "var(--color-brand-accent)"
              : "var(--color-brand-primary)",
          }}
        ></div>
      </div>
    </div>
  );
}

export default SensorCard;
