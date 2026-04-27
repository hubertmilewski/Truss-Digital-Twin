import { useSensorStore } from "../../store/useSensorStore";
import { connectSerial } from "../../utils/serialManager";
import logo from "../../assets/pb-logo.png";

function Header() {
  const { isConnected } = useSensorStore();

  return (
    <header className="flex justify-between items-center px-8 py-2 bg-surface border-b border-surface-border shadow-sm z-10">
      <div className="flex items-center gap-4">
        <img src={logo} alt="PB Logo" className="h-20" />
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full text-xs font-bold tracking-widest bg-brand-bg ${isConnected ? 'text-emerald-500' : 'text-brand-accent'}`}>
          <span className={`w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor] animate-pulse`}></span>
          {isConnected ? "POŁĄCZONO PRZEZ SERIAL" : "SYSTEM OFFLINE"}
        </div>

        {!isConnected && (
          <button 
            onClick={connectSerial} 
            className="bg-brand-primary text-white hover:bg-blue-800 transition-all font-semibold px-5 py-2 rounded-md text-sm shadow-sm active:scale-95"
          >
            PODŁĄCZ PICO
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
