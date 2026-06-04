import { useState } from "react";
import { createPortal } from "react-dom";
import { useSensorStore } from "../../store/useSensorStore";
import { connectSerial, disconnectSerial } from "../../utils/serialManager";
import logo from "../../assets/images/pb-logo.png";
import { AlertCircle, X, TriangleAlert, Settings as SettingsIcon } from "lucide-react";

function Header() {
  const { isConnected, isSignalLost, connectionError, setConnectionError, maxLoadN, setMaxLoadN } = useSensorStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="bg-surface border-b border-surface-border shadow-sm z-10">
      {/* Main header row */}
      <div className="flex justify-between items-center px-4 sm:px-8 py-2">
        <div className="flex items-center gap-4">
          <img src={logo} alt="PB Logo" className="h-12 sm:h-20" />
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-6">
          {/* Powiadomienie o błędach */}
          {connectionError && (
            <div 
              onClick={() => setConnectionError(null)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 cursor-pointer hover:bg-red-500/20 transition-all shadow-sm group"
              title="Kliknij, aby zamknąć"
            >
              <AlertCircle className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-wider whitespace-nowrap">{connectionError.toUpperCase()}</span>
              <X className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity ml-0.5 shrink-0" />
            </div>
          )}

          {/* Powiadomienie o utracie sygnału */}
          {isSignalLost && isConnected && (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 shadow-sm">
              <TriangleAlert className="w-4 h-4 sm:w-4 sm:h-4 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold tracking-wider whitespace-nowrap">UTRATA SYGNAŁU Z PICO</span>
            </div>
          )}

          {/* Status połączenia */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold tracking-widest shadow-sm border ${isConnected ? (isSignalLost ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20') : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
            {isConnected 
              ? (isSignalLost ? "BRAK DANYCH" : "PODŁĄCZONO") 
              : "NIE PODŁĄCZONO"}
          </div>

          {/* Przyciski operacyjne */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors border border-surface-border text-slate-500 hover:text-brand-primary active:scale-95 bg-white"
              title="Ustawienia ogólne"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            {isConnected && (
              <button 
                onClick={disconnectSerial} 
                className="px-5 py-2 rounded-md text-sm font-bold text-brand-secondary hover:bg-slate-100 transition-all border border-surface-border active:scale-95 bg-white"
              >
                ROZŁĄCZ
              </button>
            )}

            {!isConnected && (
              <button 
                onClick={connectSerial} 
                className="bg-brand-primary text-white hover:bg-blue-800 transition-all font-semibold px-5 py-2 rounded-md text-sm shadow-sm active:scale-95"
              >
                PODŁĄCZ PICO
              </button>
            )}
          </div>
        </div>

        {/* Mobile: compact status + hamburger */}
        <div className="flex md:hidden items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-border bg-white text-slate-500 hover:text-brand-primary active:scale-95"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
          
          {/* Compact status indicator */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm border ${isConnected ? (isSignalLost ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20') : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current ${isConnected && !isSignalLost ? 'animate-pulse shadow-[0_0_6px_currentColor]' : ''}`}></span>
            {isConnected ? (isSignalLost ? "BRAK" : "OK") : "OFF"}
          </div>

          {/* Hamburger button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-surface-border bg-white hover:bg-brand-bg transition-colors active:scale-95"
          >
            <span className={`block w-4 h-0.5 bg-brand-text rounded-full transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-brand-text rounded-full transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-brand-text rounded-full transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface px-4 py-3 flex flex-col gap-3 animate-in slide-in-from-top">
          {/* Error notifications */}
          {connectionError && (
            <div 
              onClick={() => { setConnectionError(null); }}
              className="flex items-center gap-2.5 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 cursor-pointer hover:bg-red-500/20 transition-all group"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-wider flex-1">{connectionError.toUpperCase()}</span>
              <X className="w-3.5 h-3.5 opacity-40 shrink-0" />
            </div>
          )}

          {isSignalLost && isConnected && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600">
              <TriangleAlert className="w-4 h-4 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold tracking-wider">UTRATA SYGNAŁU Z PICO</span>
            </div>
          )}

          {/* Status bar */}
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold tracking-widest shadow-sm border ${isConnected ? (isSignalLost ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20') : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
            <span className={`w-2 h-2 rounded-full bg-current ${isConnected && !isSignalLost ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`}></span>
            {isConnected 
              ? (isSignalLost ? "BRAK DANYCH" : "PODŁĄCZONO") 
              : "NIE PODŁĄCZONO"}
          </div>

          {/* Action buttons */}
          {isConnected ? (
            <button 
              onClick={() => { disconnectSerial(); setMenuOpen(false); }} 
              className="w-full py-2.5 rounded-lg text-sm font-bold text-brand-secondary border border-surface-border active:scale-95 bg-white hover:bg-slate-50 transition-colors"
            >
              ROZŁĄCZ
            </button>
          ) : (
            <button 
              onClick={() => { connectSerial(); setMenuOpen(false); }} 
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-blue-800 transition-all active:scale-95 shadow-sm"
            >
              PODŁĄCZ PICO
            </button>
          )}
        </div>
      )}

      {/* Modal Ustawień */}
      {showSettings && createPortal(
        <div className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSettings(false)}>
          <div className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-surface-border flex flex-col gap-5 animate-zoom-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-brand-text flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-brand-primary" />
                Ustawienia
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-1 text-slate-400 hover:text-brand-accent transition-colors rounded-md hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-widest mb-2">
                Maksymalny udźwig pojedynczej belki (N)
              </label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  step="0.01"
                  value={maxLoadN} 
                  onChange={(e) => setMaxLoadN(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 pr-28 border border-surface-border rounded-lg bg-slate-50 text-brand-primary font-bold font-mono focus:outline-none focus:border-brand-primary text-lg"
                />
                <span className="absolute right-4 text-sm font-bold text-slate-400 pointer-events-none select-none">
                  Niutonów (N)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">Standardowa belka 1kg = ~9.81 N.</p>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              disabled={!maxLoadN || maxLoadN <= 0}
              className="mt-2 w-full py-2.5 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 disabled:active:scale-100"
            >
              ZAPISZ I ZAMKNIJ
            </button>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

export default Header;
