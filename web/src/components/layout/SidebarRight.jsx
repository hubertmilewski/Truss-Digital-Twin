import { useSensorStore } from "../../store/useSensorStore";
import Visualization from "../visualization/Visualization";
import * as XLSX from "xlsx";

function SidebarRight() {
  const { history, sensors } = useSensorStore();

  const exportToExcel = () => {
    if (history.length === 0) {
      alert("Brak danych do eksportu!");
      return;
    }

    // Przygotowanie danych do formatu tabelarycznego
    const dataToExport = history.map(row => {
      const exportRow = { "Czas [s]": row.time };
      sensors.forEach(sensor => {
        exportRow[`${sensor.label} [g]`] = row[`${sensor.id}_g`];
        exportRow[`${sensor.label} [N]`] = row[`${sensor.id}_N`];
      });
      return exportRow;
    });

    // Tworzenie arkusza
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dane Telemetryczne");

    // Generowanie nazwy pliku z datą
    const date = new Date().toISOString().split('T')[0];
    const fileName = `Kratownica_Eksport_${date}.xlsx`;

    // Pobieranie pliku
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <aside className="bg-surface lg:border-l border-surface-border flex flex-col h-full overflow-hidden relative">
      <div className="flex-3 relative overflow-hidden">
        <div className="absolute inset-0">
          <Visualization isMiniature={true} />
        </div>
        <div className="relative z-10 p-4 sm:p-6 bg-linear-to-b from-white/90 to-transparent">
          <h3 className="text-[10px] sm:text-xs uppercase font-bold text-brand-secondary tracking-widest">
            Podgląd 3D
          </h3>
        </div>
      </div>

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
      </section>
    </aside>
  );
}

export default SidebarRight;
