/**
 * Główny obszar wykresów (2/3 szerokości po zmianie)
 */
function MainChart() {
  return (
    <section className="bg-slate-50 relative overflow-hidden flex flex-col p-8">
      <h3 className="text-xs uppercase font-bold text-brand-secondary mb-6 tracking-widest">
        Szczegółowa Analiza Obciążeń (Recharts)
      </h3>
      
      <div className="flex-1 bg-white border border-surface-border rounded-2xl shadow-inner flex flex-col items-center justify-center text-center">
        <div className="w-24 h-1 bg-brand-primary opacity-10 rounded-full mb-4"></div>
        <span className="block text-xl font-bold text-brand-secondary opacity-40 uppercase tracking-widest">
          Główny panel wykresów
        </span>
        <p className="text-brand-secondary text-sm font-medium mt-2">
          Oczekiwanie na dane pomiarowe...
        </p>
      </div>
    </section>
  );
}

export default MainChart;
