import Header from './components/layout/Header';
import SidebarLeft from './components/layout/SidebarLeft';
import MainChart from './components/telemetry/MainChart';
import SidebarRight from './components/layout/SidebarRight';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg text-brand-text">
      <Header />
      <main className="flex-1 grid grid-cols-[300px_2fr_1fr] overflow-hidden">
        <SidebarLeft />
        <MainChart />
        <SidebarRight />
      </main>

      <Footer />
    </div>
  );
}

export default App;