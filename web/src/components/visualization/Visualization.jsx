function Visualization({ isMiniature = false }) {
  return (
    <div className={`w-full h-full bg-slate-100 relative overflow-hidden flex items-center justify-center text-center`}>
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
             backgroundSize: isMiniature ? '20px 20px' : '40px 40px'
           }}
      ></div>
      
      <div className="relative z-10 p-4">
        <span className={`block ${isMiniature ? 'text-[10px]' : 'text-2xl'} font-extrabold text-brand-secondary opacity-30 tracking-[0.2em]`}>
          3D ENGINE READY
        </span>
        {!isMiniature && (
          <p className="text-brand-secondary font-medium tracking-wide mt-2">
            Oczekiwanie na model GLTF...
          </p>
        )}
      </div>
    </div>
  );
}

export default Visualization;
