import { useState, useEffect } from "react";
import { useSensorStore } from "../../store/useSensorStore";

function Footer() {
  const { isConnected, connectionStartTime, isSignalLost } = useSensorStore();
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    let interval;
    if (isConnected && connectionStartTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - connectionStartTime;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const pad = (num) => String(num).padStart(2, '0');
        setUptime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }, 1000);
    } else {
      setUptime("00:00:00");
    }

    return () => clearInterval(interval);
  }, [isConnected, connectionStartTime]);

  return (
    <footer className="hidden sm:flex bg-surface border-t border-surface-border px-4 sm:px-8 py-2 flex-col sm:flex-row justify-between items-center text-[10px] text-brand-secondary font-bold tracking-wider gap-1 sm:gap-0">
      <div className="flex gap-4 sm:gap-6 items-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          CZAS PRACY: {uptime}
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? (isSignalLost ? 'bg-amber-500' : 'bg-green-500 animate-pulse') : 'bg-slate-400'}`}></span>
          STATUS: {isConnected ? (isSignalLost ? 'BRAK SYGNAŁU' : 'POŁĄCZONO') : 'ROZŁĄCZONO'}
        </div>
      </div>
      <div className="uppercase text-center">
        © 2026 PB System Monitorowania Kratownic | Hubert Milewski
      </div>
    </footer>
  );
}

export default Footer;
