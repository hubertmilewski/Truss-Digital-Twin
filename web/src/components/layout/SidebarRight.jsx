import Visualization from "../visualization/Visualization";

function SidebarRight() {
  return (
    <aside className="bg-surface border-l border-surface-border p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Miniatura Modelu 3D */}
      <section className="flex-2 flex flex-col min-h-[300px]">
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-4 tracking-widest">
          Podgląd 3D
        </h3>
        <div className="flex-1 rounded-xl overflow-hidden border border-surface-border relative">
          <Visualization isMiniature={true} />
        </div>
      </section>

      {/* Akcje systemowe */}
      <section className="flex flex-col gap-3">
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-2 tracking-widest">
          System
        </h3>
        <button className="w-full py-3 px-4 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm uppercase tracking-widest">
          EKSPORTUJ DANE (JSON)
        </button>
      </section>
    </aside>
  );
}

export default SidebarRight;
