function SidebarRight() {
  return (
    <aside className="bg-surface border-l border-surface-border p-6 flex flex-col gap-8 overflow-y-auto">
      <section className="flex-1">
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-5 tracking-widest">Historia obciążenia</h3>
        <div className="bg-brand-bg border border-surface-border rounded-xl p-4 h-48 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-1 bg-brand-secondary opacity-20 rounded-full mb-3"></div>
          <p className="text-[10px] text-brand-secondary uppercase font-semibold tracking-wider">
            Wykres czasu rzeczywistego wyłączony
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 mt-auto">
        <button className="w-full py-3 px-4 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm uppercase tracking-widest">
          EKSPORTUJ DANE (JSON)
        </button>
        <button className="w-full py-3 px-4 bg-surface border border-surface-border text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-bg transition-colors uppercase tracking-widest">
          RESETUJ MIN/MAX
        </button>
      </section>
    </aside>
  );
}

export default SidebarRight;
