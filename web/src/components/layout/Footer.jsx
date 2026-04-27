function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-border px-8 py-2 flex justify-between items-center text-[10px] text-brand-secondary font-bold tracking-wider">
      <div className="flex gap-6 items-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          OPÓŹNIENIE: 12ms
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          BUFOR: 0.2MB
        </div>
      </div>
      <div className="uppercase">
        © 2026 PB System Monitorowania Kratownic
      </div>
    </footer>
  );
}

export default Footer;
