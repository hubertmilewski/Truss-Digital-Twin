import { useState } from "react";
import { createPortal } from "react-dom";
import { useSensorStore } from "../../store/useSensorStore";
import { connectSerial, disconnectSerial } from "../../utils/serialManager";
import { PeerManager } from "../../utils/peerManager";
import logo from "../../assets/images/pb-logo.png";
import {
  AlertCircle,
  X,
  TriangleAlert,
  Settings as SettingsIcon,
  Share2,
  Users,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

function Header() {
  const {
    isConnected,
    isSignalLost,
    connectionError,
    setConnectionError,
    maxLoadN,
    setMaxLoadN,
    isGuestMode,
    sessionId,
    viewerCount,
  } = useSensorStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isStartingHost, setIsStartingHost] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShareClick = async () => {
    if (!sessionId) {
      setIsStartingHost(true);
      try {
        await PeerManager.initHost();
      } catch (e) {
        alert("Błąd tworzenia sesji: " + e.message);
      }
      setIsStartingHost(false);
    }
    setShowShareModal(true);
  };

  const handleStopShare = () => {
    PeerManager.stopHost();
    setShowShareModal(false);
  };

  const shareUrl = sessionId
    ? `${window.location.origin}/?session=${sessionId}`
    : "";

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
          {connectionError && !isGuestMode && (
            <div
              onClick={() => setConnectionError(null)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 cursor-pointer hover:bg-red-500/20 transition-all shadow-sm group"
              title="Kliknij, aby zamknąć"
            >
              <AlertCircle className="w-4 h-4 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-wider whitespace-nowrap">
                {connectionError.toUpperCase()}
              </span>
              <X className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity ml-0.5 shrink-0" />
            </div>
          )}

          {/* Powiadomienie o utracie sygnału */}
          {isSignalLost && (isConnected || isGuestMode) && (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 shadow-sm">
              <TriangleAlert className="w-4 h-4 sm:w-4 sm:h-4 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold tracking-wider whitespace-nowrap">
                UTRATA SYGNAŁU
              </span>
            </div>
          )}

          {/* Status połączenia */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold tracking-widest shadow-sm border ${isGuestMode ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : isConnected ? (isSignalLost ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20") : "bg-red-500/5 text-red-500 border-red-500/20"}`}
          >
            {isGuestMode
              ? "TRYB WIDZA (P2P)"
              : isConnected
                ? isSignalLost
                  ? "BRAK DANYCH"
                  : "PODŁĄCZONO PICO"
                : "NIE PODŁĄCZONO"}
          </div>

          {/* Przyciski operacyjne */}
          <div className="flex items-center gap-2">
            {!isGuestMode && (
              <button
                onClick={handleShareClick}
                className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-xs transition-all border shadow-sm active:scale-95 ${sessionId ? "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20" : "bg-white text-slate-600 hover:text-brand-primary border-surface-border hover:bg-slate-50"}`}
              >
                {sessionId ? (
                  <>
                    <Users className="w-4 h-4 animate-pulse" /> WIDZÓW:{" "}
                    {viewerCount}
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" /> UDOSTĘPNIJ SESJĘ
                  </>
                )}
              </button>
            )}

            {!isGuestMode && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-md hover:bg-slate-100 transition-colors border border-surface-border text-slate-500 hover:text-brand-primary active:scale-95 bg-white"
                title="Ustawienia ogólne"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            )}

            {!isGuestMode && isConnected && (
              <button
                onClick={disconnectSerial}
                className="px-5 py-2 rounded-md text-sm font-bold text-brand-secondary hover:bg-slate-100 transition-all border border-surface-border active:scale-95 bg-white"
              >
                ROZŁĄCZ
              </button>
            )}

            {!isGuestMode && !isConnected && (
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
          {!isGuestMode && (
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-surface-border bg-white text-slate-500 hover:text-brand-primary active:scale-95"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}

          {/* Compact status indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider shadow-sm border ${isGuestMode ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : isConnected ? (isSignalLost ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20") : "bg-red-500/5 text-red-500 border-red-500/20"}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full bg-current ${!isSignalLost && (isConnected || isGuestMode) ? "animate-pulse shadow-[0_0_6px_currentColor]" : ""}`}
            ></span>
            {isGuestMode
              ? "WIDZ"
              : isConnected
                ? isSignalLost
                  ? "BRAK"
                  : "OK"
                : "OFF"}
          </div>

          {/* Hamburger button */}
          {!isGuestMode && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-surface-border bg-white hover:bg-brand-bg transition-colors active:scale-95"
            >
              <span
                className={`block w-4 h-0.5 bg-brand-text rounded-full transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-1" : ""}`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-brand-text rounded-full transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                className={`block w-4 h-0.5 bg-brand-text rounded-full transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-1" : ""}`}
              ></span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface px-4 py-3 flex flex-col gap-3 animate-in slide-in-from-top">
          {!isGuestMode && (
            <button
              onClick={handleShareClick}
              className={`flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg font-bold text-xs transition-all border shadow-sm active:scale-95 ${sessionId ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : "bg-white text-brand-secondary border-surface-border"}`}
            >
              <Share2 className="w-4 h-4" />{" "}
              {sessionId
                ? `UDOSTĘPNIONO (${viewerCount} widzów)`
                : "UDOSTĘPNIJ SESJĘ"}
            </button>
          )}

          {!isGuestMode && isConnected ? (
            <button
              onClick={() => {
                disconnectSerial();
                setMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-brand-secondary border border-surface-border active:scale-95 bg-white hover:bg-slate-50 transition-colors"
            >
              ROZŁĄCZ
            </button>
          ) : !isGuestMode ? (
            <button
              onClick={() => {
                connectSerial();
                setMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-blue-800 transition-all active:scale-95 shadow-sm"
            >
              PODŁĄCZ PICO
            </button>
          ) : null}
        </div>
      )}

      {/* Modal Ustawień */}
      {showSettings &&
        createPortal(
          <div
            className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-surface-border flex flex-col gap-5 animate-zoom-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-brand-text flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-brand-primary" />
                  Ustawienia
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-slate-400 hover:text-brand-accent transition-colors rounded-md hover:bg-slate-100"
                >
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
                    onChange={(e) =>
                      setMaxLoadN(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    disabled={isGuestMode}
                    className="w-full px-4 py-2.5 pr-28 border border-surface-border rounded-lg bg-slate-50 text-brand-primary font-bold font-mono focus:outline-none focus:border-brand-primary text-lg disabled:opacity-50"
                  />
                  <span className="absolute right-4 text-sm font-bold text-slate-400 pointer-events-none select-none">
                    Niutonów (N)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  Standardowa belka 1kg = ~9.81 N.
                </p>
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
          document.body,
        )}

      {/* Modal Udostępniania (P2P) */}
      {showShareModal &&
        createPortal(
          <div
            className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowShareModal(false)}
          >
            <div
              className="bg-surface w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-surface-border flex flex-col gap-6 animate-zoom-in relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Share2 className="w-5 h-5 mr-2" />
                  <h3 className="font-bold text-xl text-brand-text">
                    Udostępnij Sesję Na Żywo
                  </h3>
                </div>
                <p className="text-xs text-brand-secondary">
                  Zeskanuj kod QR lub użyj linku, aby połączyć się z urządzeń
                  mobilnych (Peer-to-Peer).
                </p>
              </div>

              {isStartingHost ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : sessionId ? (
                <>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value={shareUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Kod Sesji
                    </div>
                    <div className="font-mono text-lg font-bold text-brand-primary tracking-widest">
                      {sessionId}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setLinkCopied(true);
                        setTimeout(() => setLinkCopied(false), 2000);
                      }}
                      className={`flex-1 py-2.5 border rounded-lg text-xs font-bold transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2 ${
                        linkCopied 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" 
                          : "bg-white border-surface-border text-brand-secondary hover:bg-slate-50"
                      }`}
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-4 h-4" /> SKOPIOWANO
                        </>
                      ) : (
                        "KOPIUJ LINK"
                      )}
                    </button>
                    <button
                      onClick={handleStopShare}
                      className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors shadow-sm active:scale-95"
                    >
                      ZAKOŃCZ
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-red-500 py-4 font-bold">
                  Wystąpił błąd podczas generowania sesji.
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}

export default Header;
