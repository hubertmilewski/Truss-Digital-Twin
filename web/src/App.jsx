import { useState, useEffect } from 'react';
import IntroAnimation from './components/layout/IntroAnimation';
import Header from './components/layout/Header';
import SidebarLeft from './components/layout/SidebarLeft';
import MainChart from './components/telemetry/MainChart';
import SidebarRight from './components/layout/SidebarRight';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';
import TutorialWizard from './components/tutorial/TutorialWizard';
import { getModelFiles } from './utils/modelStorage';
import { useSensorStore } from './store/useSensorStore';

function App() {
  const [activeTab, setActiveTab] = useState('chart');

  useEffect(() => {
    getModelFiles().then(files => {
      if (files && files.length > 0) {
        const gltfFile = files.find(f => f.name.toLowerCase().endsWith('.gltf') || f.name.toLowerCase().endsWith('.glb'));
        if (gltfFile) {
          const fileMap = {};
          files.forEach(f => {
            fileMap[f.name] = URL.createObjectURL(f);
          });
          useSensorStore.getState().setCustomModelUrl({
            mainUrl: fileMap[gltfFile.name],
            fileMap: fileMap
          });
        }
      }
    });

    
    const params = new URLSearchParams(window.location.search);
    const sessionToJoin = params.get('session');
    if (sessionToJoin) {
      import('./utils/peerManager').then(m => {
        m.PeerManager.initViewer(sessionToJoin).catch(console.error);
      });
      
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg text-brand-text">
      <TutorialWizard />
      <IntroAnimation />
      <Header />

      
      <main className="flex-1 hidden lg:grid grid-cols-[300px_2fr_1fr] overflow-hidden">
        <SidebarLeft />
        <MainChart />
        <SidebarRight />
      </main>

      
      <main className="flex-1 lg:hidden overflow-hidden flex flex-col">
        <div className={`flex-1 ${activeTab === 'chart' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'}`}>
          {activeTab === 'telemetry' && <SidebarLeft />}
          {activeTab === 'chart' && <MainChart />}
          {activeTab === '3d' && <SidebarRight />}
        </div>
      </main>

      <Footer />

      
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;