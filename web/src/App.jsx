import { useState } from 'react';
import IntroAnimation from './components/layout/IntroAnimation';
import Header from './components/layout/Header';
import SidebarLeft from './components/layout/SidebarLeft';
import MainChart from './components/telemetry/MainChart';
import SidebarRight from './components/layout/SidebarRight';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';
import TutorialWizard from './components/tutorial/TutorialWizard';

function App() {
  const [activeTab, setActiveTab] = useState('chart');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg text-brand-text">
      <TutorialWizard />
      <IntroAnimation />
      <Header />

      {/* Desktop layout: 3-column grid */}
      <main className="flex-1 hidden lg:grid grid-cols-[300px_2fr_1fr] overflow-hidden">
        <SidebarLeft />
        <MainChart />
        <SidebarRight />
      </main>

      {/* Mobile/Tablet layout: single panel controlled by tabs */}
      <main className="flex-1 lg:hidden overflow-hidden flex flex-col">
        <div className={`flex-1 ${activeTab === 'chart' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
          {activeTab === 'telemetry' && <SidebarLeft />}
          {activeTab === 'chart' && <MainChart />}
          {activeTab === '3d' && <SidebarRight />}
        </div>
      </main>

      <Footer />

      {/* Mobile bottom navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;