import { useSensorStore } from "../../store/useSensorStore";
import { connectSerial, disconnectSerial } from "../../utils/serialManager";
import logo from "../../assets/pb-logo.png";

function Header() {
  const { isConnected, isRecording, toggleRecording, isSignalLost, connectionError, setConnectionError } = useSensorStore();

  return (
    <header className="flex justify-between items-center px-8 py-2 bg-surface border-b border-surface-border shadow-sm z-10">
      <div className="flex items-center gap-4">
        <img src={logo} alt="PB Logo" className="h-20" />
      </div>

      <div className="flex items-center gap-6">
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
            <>
              <button 
                onClick={toggleRecording} 
                className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold transition-all shadow-sm active:scale-95 ${
                  isRecording 
                  ? 'bg-brand-accent text-white hover:bg-red-700' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full bg-white ${isRecording ? 'animate-pulse' : ''}`}></span>
                {isRecording ? "STOP POMIAR" : "START POMIAR"}
              </button>

              <button 
                onClick={disconnectSerial} 
                className="px-5 py-2 rounded-md text-sm font-bold text-brand-secondary hover:bg-slate-100 transition-all border border-surface-border active:scale-95 bg-white"
              >
                ROZŁĄCZ
              </button>
            </>
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
    </header>
  );
}

export default Header;
