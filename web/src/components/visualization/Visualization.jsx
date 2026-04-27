function Visualization() {
  return (
    <section className="bg-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}
      ></div>
      
      <div className="w-full h-full flex items-center justify-center relative z-10">
        <div className="text-center">
          <span className="block text-2xl font-extrabold text-brand-secondary opacity-30 tracking-[0.2em] mb-4">
            SILNIK WIZUALIZACJI 3D GOTOWY
          </span>
          <p className="text-brand-secondary font-medium tracking-wide">
            Oczekiwanie na model GLTF...
          </p>
        </div>
      </div>
    </section>
  );
}

export default Visualization;
