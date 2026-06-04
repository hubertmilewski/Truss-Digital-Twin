import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Filter out internal Three.js deprecation warnings and missing texture errors
// that we cannot fix directly because they are deeply nested in R3F/GLTFLoader
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && (
    args[0].includes('THREE.Clock:') || 
    args[0].includes('THREE.WebGLShadowMap:') ||
    args[0].includes('The width') && args[0].includes('should be greater than 0')
  )) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes("Couldn't load texture")) {
    return;
  }
  originalError(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
