function SensorCard({ label, value, unit = "g", maxLoad = 5000 }) {
  const loadPercentage = Math.min((value / maxLoad) * 100, 100);
  const isOverloaded = value > maxLoad * 0.8;

  return (
    <div className="bg-brand-bg border border-surface-border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <label className="block text-[10px] font-bold text-brand-secondary uppercase mb-2 tracking-wider">
        {label}
      </label>
      <div className="text-4xl font-bold text-brand-primary mb-3 font-mono">
        {value}<span className="text-sm font-normal text-brand-secondary ml-1">{unit}</span>
      </div>
      <div className="h-1.5 w-full bg-surface-border rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-300 ease-out" 
          style={{ 
            width: `${loadPercentage}%`,
            backgroundColor: isOverloaded ? 'var(--color-brand-accent)' : 'var(--color-brand-primary)'
          }}
        ></div>
      </div>
    </div>
  );
}

export default SensorCard;
