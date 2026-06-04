import { useRef, useState } from "react";
import { Expand, X, Trash2 } from "lucide-react";
import { useSensorStore } from "../../store/useSensorStore";
import Visualization from "../visualization/Visualization";
import * as XLSX from "xlsx";
import { saveModelFiles, clearModelFiles } from "../../utils/modelStorage";

function SidebarRight() {
  const setCustomModelUrl = useSensorStore(state => state.setCustomModelUrl);
  const customModelUrl = useSensorStore(state => state.customModelUrl);
  const isGuestMode = useSensorStore(state => state.isGuestMode);
  
  const fileInputRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closeFullscreen = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsFullscreen(false);
      setIsClosing(false);
    }, 200);
  };

  const exportToExcel = () => {
    const { history, sensors } = useSensorStore.getState();
    
    if (!history || history.length === 0) {
      alert("Brak danych do eksportu!");
      return;
    }

    const dataToExport = history.map(row => {
      const exportRow = { "Czas [s]": row.time };
      sensors.forEach(sensor => {
        exportRow[`${sensor.label} [g]`] = row[`${sensor.id}_g`];
        exportRow[`${sensor.label} [N]`] = row[`${sensor.id}_N`];
      });
      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dane Telemetryczne");

    const date = new Date().toISOString().split('T')[0];
    const fileName = `Kratownica_Eksport_${date}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleImportModel = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const gltfFile = files.find(f => f.name.toLowerCase().endsWith('.gltf') || f.name.toLowerCase().endsWith('.glb'));
      if (!gltfFile) {
        alert("Nie znaleziono pliku .gltf lub .glb w wybranym folderze/plikach.");
        return;
      }

      if (customModelUrl && typeof customModelUrl === 'object') {
        Object.values(customModelUrl.fileMap).forEach(url => URL.revokeObjectURL(url));
      } else if (customModelUrl && typeof customModelUrl === 'string') {
        URL.revokeObjectURL(customModelUrl);
      }

      const fileMap = {};
      files.forEach(f => {
        fileMap[f.name] = URL.createObjectURL(f);
      });

      setCustomModelUrl({
        mainUrl: fileMap[gltfFile.name],
        fileMap: fileMap
      });

      // Zapisujemy pliki do IndexedDB, żeby pamiętać je po przeładowaniu strony
      await saveModelFiles(files);
    }
  };

  const handleClearModel = async () => {
    if (customModelUrl && typeof customModelUrl === 'object') {
      Object.values(customModelUrl.fileMap).forEach(url => URL.revokeObjectURL(url));
    }
    setCustomModelUrl(null);
    await clearModelFiles();
  };

  return (
    <aside className="bg-surface lg:border-l border-surface-border flex flex-col h-full overflow-hidden relative">
      <div className="flex-3 relative overflow-hidden group">
        <div className="absolute inset-0">
          <Visualization isMiniature={true} />
        </div>
        <div className="relative z-10 p-4 sm:p-6 bg-linear-to-b from-white/90 to-transparent flex justify-between items-start pointer-events-none">
          <h3 className="text-[10px] sm:text-xs uppercase font-bold text-brand-secondary tracking-widest">
            Podgląd 3D
          </h3>
          <button 
            onClick={() => setIsFullscreen(true)}
            className="w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-md shadow-sm border border-surface-border text-brand-secondary transition-all opacity-0 group-hover:opacity-100 pointer-events-auto active:scale-95"
            title="Powiększ na cały ekran"
          >
            <Expand className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isGuestMode && (
        <section className="flex flex-col gap-3 p-3 sm:p-6 border-t border-surface-border bg-surface">
          <h3 className="text-xs uppercase font-bold text-brand-secondary mb-2 tracking-widest">
            System
          </h3>
          <button 
            onClick={exportToExcel}
            className="w-full py-3 px-4 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-sm uppercase tracking-widest active:scale-95"
          >
            EKSPORTUJ DANE (XLSX)
          </button>
          
          <input 
            type="file" 
            webkitdirectory="true"
            multiple
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImportModel} 
          />
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 bg-white text-brand-secondary border border-surface-border text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm uppercase tracking-widest active:scale-95"
            >
              {customModelUrl ? 'ZMIEŃ MODEL' : 'IMPORTUJ MODEL (FOLDER)'}
            </button>
            
            {customModelUrl && (
              <button 
                onClick={handleClearModel}
                title="Usuń model z pamięci"
                className="w-12 flex items-center justify-center bg-white text-red-500 border border-surface-border rounded-lg hover:bg-red-50 transition-colors shadow-sm active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      )}

      {(isFullscreen || isClosing) && (
        <div 
          className={`fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8 bg-slate-900/40 backdrop-blur-sm ${
            isClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={closeFullscreen}
        >
          <div 
            className={`bg-surface w-full max-w-5xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-surface-border ${
              isClosing ? "animate-zoom-out" : "animate-zoom-in"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-surface-border bg-white">
              <h3 className="text-xs uppercase font-bold text-brand-secondary tracking-widest">
                Podgląd 3D
              </h3>
              <button 
                onClick={closeFullscreen}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-brand-secondary font-bold text-[10px] sm:text-xs rounded-lg transition-colors active:scale-95 flex items-center gap-2 tracking-wider"
              >
                <X className="w-4 h-4" />
                ZAMKNIJ
              </button>
            </div>
            <div className="flex-1 relative bg-slate-50">
              <Visualization isMiniature={false} />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default SidebarRight;
