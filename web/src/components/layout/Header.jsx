import { useState } from "react";
import { useSensorStore } from "../../store/useSensorStore";
import { connectSerial, disconnectSerial } from "../../utils/serialManager";
import logo from "../../assets/pb-logo.png";

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
              className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-200 rounded-lg text-red-600 text-[10px] font-bold shadow-sm cursor-pointer hover:bg-red-200 transition-colors"
              title="Kliknij, aby zamknąć"
            >
              <span className="text-sm">❌</span> {connectionError.toUpperCase()}
            </div>
          )}

          {/* Powiadomienie o utracie sygnału */}
          {isSignalLost && isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-200 rounded-lg text-red-600 text-[10px] font-bold shadow-sm">
              <span className="text-sm">⚠️</span> UTRATA SYGNAŁU Z PICO
            </div>
          )}

          {/* Status połączenia */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full text-xs font-bold tracking-widest bg-brand-bg ${isConnected ? (isSignalLost ? 'text-amber-500' : 'text-emerald-500') : 'text-brand-accent'}`}>
            <span className={`w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor] ${isConnected && !isSignalLost ? 'animate-pulse' : ''}`}></span>
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
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider bg-brand-bg ${isConnected ? (isSignalLost ? 'text-amber-500' : 'text-emerald-500') : 'text-brand-accent'}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor] ${isConnected && !isSignalLost ? 'animate-pulse' : ''}`}></span>
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
              className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[10px] font-bold cursor-pointer"
            >
              <span className="text-xs">❌</span> {connectionError.toUpperCase()}
            </div>
          )}

          {isSignalLost && isConnected && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[10px] font-bold">
              <span className="text-xs">⚠️</span> UTRATA SYGNAŁU Z PICO
            </div>
          )}

          {/* Status bar */}
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold tracking-widest bg-brand-bg ${isConnected ? (isSignalLost ? 'text-amber-500' : 'text-emerald-500') : 'text-brand-accent'}`}>
            <span className={`w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor] ${isConnected && !isSignalLost ? 'animate-pulse' : ''}`}></span>
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
