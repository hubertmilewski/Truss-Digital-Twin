import { Suspense, useMemo, useState, useRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Bounds, ContactShadows, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { useSensorStore } from "../../store/useSensorStore";
import * as THREE from 'three';

const getMeshPath = (mesh) => {
  let path = mesh.name || mesh.uuid;
  let curr = mesh.parent;
  while(curr && curr.type !== 'Scene') {
    path = (curr.name || curr.uuid) + '/' + path;
    curr = curr.parent;
  }
  return path;
};

// Zoptymalizowany komponent etykiety, aktualizujący DOM bezpośrednio, bez renderów Reacta
function LiveLabel({ sensorId, position, displayUnit }) {
  const divRef = useRef(null);

  useFrame(() => {
    if (!divRef.current) return;
    const data = useSensorStore.getState().sensorData;
    const valueN = data[`${sensorId}_N`] || 0;
    const valueG = data[`${sensorId}_g`] || 0;
    
    const valToDisplay = displayUnit === 'N' ? valueN.toFixed(1) : valueG.toFixed(0);
    const isTension = valueN > 0;
    
    // Zmiana tekstu
    divRef.current.innerText = `${valToDisplay} ${displayUnit}`;
    
    // Zmiana klas CSS na bieżąco, aby uniknąć re-renderów
    const baseClasses = "px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm border backdrop-blur-md pointer-events-none transition-colors";
    if (Math.abs(valueN) > 0.5) {
      if (isTension) {
        divRef.current.className = `${baseClasses} bg-red-500/90 text-white border-red-600`;
      } else {
        divRef.current.className = `${baseClasses} bg-blue-500/90 text-white border-blue-600`;
      }
    } else {
      divRef.current.className = `${baseClasses} bg-white/80 text-slate-700 border-slate-200`;
    }
  });

  return (
    <Html position={position} center>
      <div ref={divRef} className="px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-sm border backdrop-blur-md pointer-events-none transition-colors bg-white/80 text-slate-700 border-slate-200" />
    </Html>
  );
}

// Component to load and display a custom GLTF model with multiple files
function CustomModel({ modelData, isFullscreen }) {
  // UWAGA: Nie subskrybujemy się pod `sensorData`, aby CustomModel nie przerenderowywał się 100 razy na sekundę!
  const sensors = useSensorStore(state => state.sensors);
  const meshSensorMap = useSensorStore(state => state.meshSensorMap);
  const setMeshSensorMapping = useSensorStore(state => state.setMeshSensorMapping);
  const maxLoadN = useSensorStore(state => state.maxLoadN);
  const displayUnit = useSensorStore(state => state.displayUnit);
  const isGuestMode = useSensorStore(state => state.isGuestMode);
  
  const [selectedMesh, setSelectedMesh] = useState(null);

  const gltf = useLoader(GLTFLoader, modelData.mainUrl, (loader) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    loader.setDRACOLoader(dracoLoader);

    loader.manager.setURLModifier((urlToResolve) => {
      let filename = urlToResolve;
      try {
        const parsedUrl = new URL(urlToResolve);
        filename = decodeURIComponent(parsedUrl.pathname.split('/').pop());
      } catch (e) {
        filename = decodeURIComponent(urlToResolve.split('/').pop());
      }
      if (modelData.fileMap[filename]) return modelData.fileMap[filename];
      return urlToResolve;
    });
  });

  // Clone scene and setup materials/paths
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone();
    cloned.updateMatrixWorld(true);
    let meshCount = 0;
    cloned.traverse((child) => {
      if (child.isMesh) {
        if (!child.name) child.name = `unnamed_mesh_${meshCount++}`;
        child.userData.originalMaterial = child.material.clone();
        child.material = child.material.clone();
        child.userData.path = getMeshPath(child);
        
        // Pre-calculate center for labels
        child.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        child.geometry.boundingBox.getCenter(center);
        child.localToWorld(center);
        child.userData.worldCenter = center;
      }
    });
    return cloned;
  }, [gltf.scene]);

  const colorRed = useMemo(() => new THREE.Color("#ef4444"), []);
  const colorBlue = useMemo(() => new THREE.Color("#3b82f6"), []);

  useFrame(() => {
    if (!scene) return;
    // Pobieramy najświeższe dane bezpośrednio bez wyzwalania re-rendera
    const data = useSensorStore.getState().sensorData;
    
    scene.traverse((child) => {
      if (child.isMesh) {
        const sensorId = meshSensorMap[child.userData.path];
        const baseColor = child.userData.originalMaterial.color;
        
        if (sensorId) {
          const valueN = data[`${sensorId}_N`] || 0;
          const intensity = Math.min(Math.abs(valueN) / maxLoadN, 1.0);
          
          if (valueN > 0.5) { // Tension
             child.material.color.copy(baseColor).lerp(colorRed, intensity * 0.8 + 0.2);
          } else if (valueN < -0.5) { // Compression
             child.material.color.copy(baseColor).lerp(colorBlue, intensity * 0.8 + 0.2);
          } else {
             child.material.color.lerp(baseColor, 0.1);
          }
        } else {
           child.material.color.lerp(baseColor, 0.1);
        }
      }
    });
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (isGuestMode) return;
    if (e.object.isMesh && isFullscreen) {
      setSelectedMesh({
        path: e.object.userData.path,
        name: e.object.name,
        position: e.point.clone()
      });
    }
  };

  const handlePointerMissed = () => {
    if (isFullscreen) setSelectedMesh(null);
  };

  const mappedElements = useMemo(() => {
    const elements = [];
    scene.traverse((child) => {
      if (child.isMesh && meshSensorMap[child.userData.path]) {
        elements.push({
          path: child.userData.path,
          sensorId: meshSensorMap[child.userData.path],
          position: child.userData.worldCenter,
        });
      }
    });
    return elements;
  }, [scene, meshSensorMap]);

  return (
    <group onPointerDown={handlePointerDown} onPointerMissed={handlePointerMissed}>
      <primitive object={scene} />
      
      {/* Interaktywny popover mapowania (tylko w trybie pełnoekranowym) */}
      {selectedMesh && isFullscreen && (
        <Html position={selectedMesh.position} center zIndexRange={[100, 0]}>
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 min-w-[220px] flex flex-col gap-3 transform -translate-y-1/2 cursor-default" onPointerDown={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 truncate block pr-4">
                {selectedMesh.name}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedMesh(null); }}
                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Przypisz czujnik
              </label>
              <select 
                className="w-full text-sm p-2 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer"
                value={meshSensorMap[selectedMesh.path] || ""}
                onChange={(e) => {
                  setMeshSensorMapping(selectedMesh.path, e.target.value);
                  setSelectedMesh(null);
                }}
              >
                <option value="">Brak (odepnij)</option>
                {sensors.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Html>
      )}

      {/* Etykiety na żywo dla przypisanych belek */}
      {mappedElements.map((el) => (
        <LiveLabel key={el.path} sensorId={el.sensorId} position={el.position} displayUnit={displayUnit} />
      ))}
    </group>
  );
}

function Visualization({ isMiniature = false }) {
  const { customModelUrl } = useSensorStore();

  return (
    <div className={`w-full h-full bg-slate-100 relative overflow-hidden flex items-center justify-center text-center`}>
      <div className="absolute inset-0 pointer-events-none z-0" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)',
             backgroundSize: isMiniature ? '20px 20px' : '40px 40px'
           }}
      ></div>

      {customModelUrl && (
        <div className="absolute inset-0 z-10 cursor-move">
          <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={1024} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <Bounds fit clip margin={isMiniature ? 1.5 : 1.2}>
                <CustomModel modelData={customModelUrl} isFullscreen={!isMiniature} />
              </Bounds>
              <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
              <Environment preset="city" />
            </Suspense>
            
            <OrbitControls 
              makeDefault 
              enablePan={!isMiniature} 
              enableZoom={!isMiniature} 
              autoRotate={isMiniature}
              autoRotateSpeed={1.5}
            />
          </Canvas>
        </div>
      )}
      
      {!customModelUrl && (
        <div className="relative z-10 p-4">
          <span className={`block ${isMiniature ? 'text-[10px]' : 'text-2xl'} font-extrabold text-brand-secondary opacity-30 tracking-[0.2em]`}>
            3D ENGINE READY
          </span>
          {!isMiniature && (
            <p className="text-brand-secondary font-medium tracking-wide mt-2">
              Oczekiwanie na model GLTF...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Visualization;
