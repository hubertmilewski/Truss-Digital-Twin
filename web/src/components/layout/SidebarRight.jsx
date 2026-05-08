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
    <aside className="bg-surface border-l border-surface-border p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Miniatura Modelu 3D */}
      <section className="flex-2 flex flex-col min-h-[300px]">
        <h3 className="text-xs uppercase font-bold text-brand-secondary mb-4 tracking-widest">
          Podgląd 3D
        </h3>
        <div className="flex-1 rounded-xl overflow-hidden border border-surface-border relative">
          <Visualization isMiniature={true} />
        </div>
      </section>

      {/* Akcje systemowe */}
      <section className="flex flex-col gap-3">
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
