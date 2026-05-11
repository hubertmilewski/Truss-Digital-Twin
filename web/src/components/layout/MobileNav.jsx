function MobileNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'telemetry', label: 'Telemetria', icon: '📊' },
    { id: 'chart', label: 'Wykres', icon: '📈' },
    { id: '3d', label: '3D / Eksport', icon: '🧊' },
  ];

  return (
    <nav className="lg:hidden bg-surface border-t border-surface-border flex items-stretch safe-bottom">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-brand-primary bg-blue-50 border-t-2 border-brand-primary'
              : 'text-brand-secondary hover:text-brand-text border-t-2 border-transparent'
          }`}
        >
          <span className="text-base leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileNav;
