import { useState, useEffect } from "react";
import { useSensorStore } from "../../store/useSensorStore";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  Download,
  FilePlusCorner,
  Settings,
  Scale,
  Eye,
  CheckCircle2,
  Code,
  Expand,
  Minimize2,
} from "lucide-react";

import hx711Code from "../../assets/scripts/hx711.py?raw";
import kalibracjaCode from "../../assets/scripts/kalibracja.py?raw";
import mainCode from "../../assets/scripts/main.py?raw";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import headerImg from "../../assets/images/header.png";
import leftsideImg from "../../assets/images/leftside.png";
import mainsideImg from "../../assets/images/mainside.png";
import rightsideImg from "../../assets/images/rightside.png";
import shareImg from "../../assets/images/share.png";

function CodeBlock({ code, filename }) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const closeFullscreen = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsFullscreen(false);
      setIsClosing(false);
    }, 200);
  };

  return (
    <>
      <div className="mt-4 rounded-xl border border-surface-border bg-slate-900 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/20">
          <span className="text-xs font-mono font-bold text-slate-300">
            {filename}
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
              title="Pełny ekran"
            >
              <Expand className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
              title="Kopiuj do schowka"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
              title="Pobierz plik"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div
          id={`code-scroll-${filename}`}
          className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-[40vh] custom-scrollbar"
        >
          <SyntaxHighlighter
            language="python"
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLines={true}
            lineProps={(lineNumber) => ({
              id: `line-${filename}-${lineNumber}`,
              style: { display: "block" },
            })}
            customStyle={{ margin: 0, padding: 0, background: "transparent" }}
            codeTagProps={{ style: { fontFamily: "inherit" } }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>

      {(isFullscreen || isClosing) && (
        <div
          className={`fixed inset-0 z-400 flex items-center justify-center p-4 sm:p-8 bg-slate-900/40 backdrop-blur-sm ${
            isClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={closeFullscreen}
        >
          <div
            className={`bg-slate-900 w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10 ${
              isClosing ? "animate-zoom-out" : "animate-zoom-in"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 shrink-0">
              <span className="text-sm font-mono font-bold text-slate-300">
                {filename}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                  title="Kopiuj do schowka"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                  title="Pobierz plik"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="w-px h-5 bg-white/20 mx-1"></div>
                <button
                  onClick={closeFullscreen}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors text-xs font-bold"
                >
                  <Minimize2 className="w-4 h-4" /> ZAMKNIJ
                </button>
              </div>
            </div>
            <div
              id={`code-scroll-fs-${filename}`}
              className="p-4 sm:p-6 overflow-auto text-sm font-mono leading-relaxed flex-1 custom-scrollbar"
            >
              <SyntaxHighlighter
                language="python"
                style={vscDarkPlus}
                showLineNumbers={true}
                wrapLines={true}
                lineProps={(lineNumber) => ({
                  id: `line-fs-${filename}-${lineNumber}`,
                  style: { display: "block" },
                })}
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: "transparent",
                }}
                codeTagProps={{ style: { fontFamily: "inherit" } }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TutorialWizard() {
  const { tutorialCompleted, completeTutorial, maxLoadN, setMaxLoadN } =
    useSensorStore();
  const [step, setStep] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [tourSlide, setTourSlide] = useState(0);

  useEffect(() => {
    if (!tutorialCompleted) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [tutorialCompleted]);

  // Autoodtwarzanie prezentacji w ostatnim kroku
  useEffect(() => {
    let timer;
    if (step === 4 && tourSlide < 4) {
      timer = setTimeout(() => {
        setTourSlide((prev) => prev + 1);
      }, 8000); // 8 sekund na każdy slajd
    }
    return () => clearTimeout(timer);
  }, [step, tourSlide]);

  if (tutorialCompleted || !isReady) return null;

  const handleNext = () => {
    if (step === 3 && (!maxLoadN || maxLoadN <= 0)) return;
    if (step < 4) {
      setStep(step + 1);
    } else if (tourSlide < 4) {
      setTourSlide(tourSlide + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrev = () => {
    if (step === 4 && tourSlide > 0) {
      setTourSlide(tourSlide - 1);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-brand-primary">
                <FilePlusCorner className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text">
                  Krok 1: Biblioteka bazowa
                </h3>
                <p className="text-xs text-brand-secondary">
                  Sterownik sprzętowy wagi (HX711)
                </p>
              </div>
            </div>
            <p className="text-sm text-brand-text/80 mb-4">
              Aby Raspberry Pi Pico mogło komunikować się ze wzmacniaczem
              sygnału (hx711), potrzebuje odpowiedniego sterownika.
              <strong>
                Utwórz na swoim urządzeniu plik o nazwie{" "}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-brand-primary">
                  hx711.py
                </code>
              </strong>{" "}
              i wklej do niego poniższy kod (lub go po prostu pobierz). Nie
              musisz go w żaden sposób edytować.
            </p>
            <CodeBlock code={hx711Code} filename="hx711.py" />
          </div>
        );
      case 1:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text">
                  Krok 2: Kalibracja belek
                </h3>
                <p className="text-xs text-brand-secondary">
                  Ustalanie tary i proporcji obciążenia
                </p>
              </div>
            </div>
            <p className="text-sm text-brand-text/80 mb-4">
              Każda belka tensometryczna jest minimalnie inna. Użyjemy tego
              skryptu, aby zdobyć unikalne parametry kalibracji. Skopiuj ten kod
              do pliku{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-600">
                kalibracja.py
              </code>{" "}
              na urządzeniu, podłącz wybraną belkę i uruchom program. Konsola
              poprosi Cię o odciążenie wagi (aby pobrać tarę) a następnie
              położenie wzorca (znanego ciężaru, np. odważnika 100g). Zapisz
              wygenerowaną na końcu <strong>Tarę</strong> i{" "}
              <strong>Współczynnik</strong> – zaraz będziemy ich potrzebować!
            </p>
            <CodeBlock code={kalibracjaCode} filename="kalibracja.py" />
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text">
                  Krok 3: Program docelowy
                </h3>
                <p className="text-xs text-brand-secondary">
                  Kod odczytujący i buforujący dane (main.py)
                </p>
              </div>
            </div>
            <p className="text-sm text-brand-text/80 mb-4">
              To jest główny program, który zbiera dane, filtruje je (wyciągając
              średnią kroczącą z X próbek, by wyeliminować szumy) i przesyła do
              aplikacji webowej. W tym kodzie{" "}
              <strong>musisz dokonać edycji!</strong>
              <br />
              <br />
              Odszukaj miejsca definiującego belki i podmień{" "}
              <span className="text-brand-primary font-mono text-xs">
                tara
              </span>{" "}
              oraz{" "}
              <span className="text-brand-primary font-mono text-xs">
                wspolczynnik
              </span>{" "}
              na te z poprzedniego kroku. Zapisz plik jako{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-600">
                main.py
              </code>{" "}
              na Pico, aby odpalał się automatycznie po podłączeniu zasilania.
            </p>

            <button
              onClick={() => {
                const startEl = document.getElementById("line-main.py-70");
                if (startEl) {
                  startEl.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });

                  // Zaznaczamy cały blok od linii 70 do 95
                  for (let i = 70; i <= 95; i++) {
                    const line = document.getElementById(`line-main.py-${i}`);
                    if (line) {
                      line.style.backgroundColor = "rgba(59, 130, 246, 0.25)";
                      line.style.transition = "background-color 0.5s ease-out";
                      setTimeout(
                        () => (line.style.backgroundColor = "transparent"),
                        2000,
                      );
                    }
                  }

                  const container = document.getElementById(
                    "code-scroll-main.py",
                  );
                  if (container) {
                    container.style.borderColor = "#3b82f6";
                    container.style.transition = "border-color 0.5s ease-out";
                    setTimeout(() => (container.style.borderColor = ""), 2000);
                  }
                }
              }}
              className="mb-4 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-md text-xs font-bold transition-colors border border-emerald-500/20 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Pokaż gdzie wkleić kalibrację
            </button>

            <CodeBlock code={mainCode} filename="main.py" />
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text">
                  Krok 4: Parametry Wizualizacji
                </h3>
                <p className="text-xs text-brand-secondary">
                  Ostatnie szlify do aplikacji webowej
                </p>
              </div>
            </div>
            <p className="text-sm text-brand-text/80 mb-6">
              Oprogramowanie sprzętowe jest już gotowe! Teraz powiedz nam tylko,
              jakiej belki używasz. Dzięki temu suwaki postępu (znajdujące się
              pod wykresami sił) będą odpowiednio pokazywać procent obciążenia i
              warnować o przeciążeniu.
            </p>

            <div className="bg-surface border border-surface-border p-6 rounded-xl shadow-sm">
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-widest mb-2">
                Maksymalny udźwig pojedynczej belki (N)
              </label>
              <div className="relative flex items-center w-full sm:w-64">
                <input
                  type="number"
                  step="0.01"
                  value={maxLoadN}
                  onChange={(e) =>
                    setMaxLoadN(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  className="w-full px-4 py-2 pr-28 border border-surface-border rounded-lg bg-white text-brand-primary font-bold font-mono text-lg focus:outline-none focus:border-brand-primary"
                />
                <span className="absolute right-4 text-sm font-bold text-slate-400 pointer-events-none select-none">
                  Niutonów (N)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">
                Standardowa belka 1kg = ~9.81 N. (Możesz zmienić tę opcję
                później).
              </p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in flex flex-col items-center">
            <h3 className="text-2xl font-bold text-brand-text mb-2 text-center">
              Gotowe! Szybki Tour
            </h3>
            <p className="text-sm text-brand-text/80 text-center max-w-md mb-6">
              Kratownica jest gotowa do testów. Oto krótka nawigacja po
              interfejsie aplikacji:
            </p>

            <div className="w-full bg-slate-50 border border-surface-border rounded-xl p-4 sm:p-6 mb-4 relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${tourSlide * 100}%)` }}
              >
                {/* Slajd 1 */}
                <div className="w-full shrink-0 px-2 flex flex-col items-center">
                  <div className="w-full h-56 sm:h-72 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={headerImg}
                      alt="Górny Pasek"
                      className="max-w-full max-h-full object-contain drop-shadow-lg rounded-md border border-slate-200/50"
                    />
                  </div>
                  <h4 className="font-bold text-brand-primary text-base uppercase mb-2 text-center">
                    Górny Pasek
                  </h4>
                  <p className="text-sm text-slate-600 text-center max-w-sm">
                    Znajdziesz tu przycisk <strong>PODŁĄCZ PICO</strong>, status
                    połączenia oraz opcję <strong>UDOSTĘPNIJ SESJĘ</strong> na
                    żywo dla innych widzów.
                  </p>
                </div>

                {/* Slajd 2 */}
                <div className="w-full shrink-0 px-2 flex flex-col items-center">
                  <div className="w-full h-56 sm:h-72 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={leftsideImg}
                      alt="Lewy Panel"
                      className="max-w-full max-h-full object-contain drop-shadow-lg rounded-md border border-slate-200/50"
                    />
                  </div>
                  <h4 className="font-bold text-brand-primary text-base uppercase mb-2 text-center">
                    Lewy Panel
                  </h4>
                  <p className="text-sm text-slate-600 text-center max-w-sm">
                    Kafelki ze stanem nacisku poszczególnych belek na żywo oraz
                    bardzo ważne z perspektywy badań{" "}
                    <strong>EKSTREMA (Min/Max)</strong> z czasem ich wystąpienia.
                  </p>
                </div>

                {/* Slajd 3 */}
                <div className="w-full shrink-0 px-2 flex flex-col items-center">
                  <div className="w-full h-56 sm:h-72 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={mainsideImg}
                      alt="Wykres"
                      className="max-w-full max-h-full object-contain drop-shadow-lg rounded-md border border-slate-200/50"
                    />
                  </div>
                  <h4 className="font-bold text-brand-primary text-base uppercase mb-2 text-center">
                    Wykres (Środek)
                  </h4>
                  <p className="text-sm text-slate-600 text-center max-w-sm">
                    Wykres liniowy działający na żywo, przełączniki gramy/Niutony
                    oraz ogromny przycisk <strong>START / STOP POMIAR</strong>,
                    rozpoczynający rejestrację na wykresie.
                  </p>
                </div>

                {/* Slajd 4 */}
                <div className="w-full shrink-0 px-2 flex flex-col items-center">
                  <div className="w-full h-56 sm:h-72 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={rightsideImg}
                      alt="Prawy Panel"
                      className="max-w-full max-h-full object-contain drop-shadow-lg rounded-md border border-slate-200/50"
                    />
                  </div>
                  <h4 className="font-bold text-brand-primary text-base uppercase mb-2 text-center">
                    Prawy Panel
                  </h4>
                  <p className="text-sm text-slate-600 text-center max-w-sm">
                    Opcje <strong>eksportu badań (XLSX)</strong> oraz
                    wgrywania cyfrowego bliźniaka 3D (import folderu). W trybie
                    pełnoekranowym modelu możesz <strong>kliknąć na dowolną belkę</strong>,
                    aby przypisać do niej czujnik telemetrii!
                  </p>
                </div>
                {/* Slajd 5 */}
                <div className="w-full shrink-0 px-2 flex flex-col items-center">
                  <div className="w-full h-56 sm:h-72 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                    <img
                      src={shareImg}
                      alt="Udostępnianie Sesji"
                      className="max-w-full max-h-full object-contain drop-shadow-lg rounded-md border border-slate-200/50"
                    />
                  </div>
                  <h4 className="font-bold text-brand-primary text-base uppercase mb-2 text-center">
                    Udostępnianie i Dołączanie
                  </h4>
                  <p className="text-sm text-slate-600 text-center max-w-sm">
                    Po wygenerowaniu sesji otrzymasz kod dostępu oraz kod QR. Widzowie
                    mogą wejść na tę samą stronę i wpisać kod lub zeskanować QR, by na żywo podglądać Twoje odczyty (w trybie <strong>WIDZA</strong> P2P).
                  </p>
                </div>
              </div>

              {/* Kropki nawigacji */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setTourSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      tourSlide === idx
                        ? "bg-brand-primary w-6"
                        : "bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-surface-border flex flex-col max-h-[90vh]">
        {/* Header - Pasek Postępu */}
        <div className="px-6 py-4 border-b border-surface-border bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 sm:w-12 rounded-full transition-colors duration-300 ${i <= step ? "bg-brand-primary" : "bg-surface-border"}`}
              ></div>
            ))}
          </div>
          <span className="text-xs font-bold text-brand-secondary tracking-widest uppercase">
            Krok {step + 1} z 5
          </span>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {renderStepContent()}
        </div>

        {/* Footer - Controls */}
        <div className="px-6 py-4 border-t border-surface-border bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${step === 0 ? "opacity-0 pointer-events-none" : "text-brand-secondary hover:bg-slate-200"}`}
          >
            <ChevronLeft className="w-4 h-4" /> Cofnij
          </button>

          <button
            onClick={handleNext}
            disabled={step === 3 && (!maxLoadN || maxLoadN <= 0)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 ${
              step === 3 && (!maxLoadN || maxLoadN <= 0)
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-brand-primary text-white hover:bg-blue-800"
            }`}
          >
            {step === 4 && tourSlide === 4 ? (
              <>
                ROZPOCZNIJ PRACĘ <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                Dalej <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialWizard;
