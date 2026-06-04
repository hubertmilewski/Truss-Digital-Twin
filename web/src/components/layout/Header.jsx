import { useState } from "react";
import { useSensorStore } from "../../store/useSensorStore";
import { connectSerial, disconnectSerial } from "../../utils/serialManager";
import logo from "../../assets/pb-logo.png";
import { AlertCircle, X, TriangleAlert } from "lucide-react";

function Header() {
  const { isConnected, isSignalLost, connectionError, setConnectionError } = useSensorStore();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="flex md:hidden items-center gap-3">
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
    </header>
  );
}

export default Header;
