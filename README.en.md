# Truss Digital Twin | Load Monitoring System

> Read this in: [Polski](./README.md)

![Main application view during an active measurement session](./docs/mainapp.png)

An engineering project combining measurement hardware with a modern web application. It records forces acting on individual truss members in real time, visualizes them on an interactive chart, and overlays the results directly onto a three-dimensional model of the structure.

---

## What does this application do?

Strain gauge sensors connected to a Raspberry Pi Pico measure forces (in grams and newtons) on selected truss beams. The data travels over USB to the browser, where the user can observe it live, record a measurement session, and then analyze the results or export them to a spreadsheet.

The second major module is 3D visualization. The user loads a custom geometric model (GLTF/GLB format) and assigns sensors to specific mesh elements. From that point the model comes alive - beams change color proportionally to the force acting on them, red for tension, blue for compression.

The entire session can also be shared in real time with other devices with a single click, without any server.

---

## Project Structure

```
truss-digital-twin/
├── Raspberry Pico/          # Microcontroller firmware (MicroPython)
│   ├── hx711.py             # HX711 ADC driver
│   └── main.py              # Data acquisition and JSON transmission logic
│
└── web/                     # Web application (React + Vite)
    └── src/
        ├── components/
        │   ├── layout/      # Header, sidebars, mobile navigation
        │   ├── telemetry/   # Charts and sensor data cards
        │   ├── tutorial/    # First-run setup wizard
        │   └── visualization/ # 3D engine (Three.js)
        ├── store/           # Global application state (Zustand)
        └── utils/           # Serial port, P2P session, and model management
```

---

## How to Run

### Raspberry Pi Pico

1. Connect the HX711 sensors to the GPIO pins as defined in `main.py` (defaults: sensors A, B, C on pin pairs 2/3, 4/5, 6/7).
2. Upload `hx711.py` and `main.py` to the Pico using Thonny or mpremote.
3. Run `main.py` - the Pico will begin sending JSON packets over USB every few milliseconds.

> Before first use, each sensor must be calibrated to determine its `tara` (tare) and `wspolczynnik` (scale factor) values. These are set manually in `main.py`.

### Web Application

Node.js version 18 or newer is required.

```bash
cd web
npm install
npm run dev
```

The application starts at `http://localhost:5173` by default and is available on the local network (via the `--host` flag).

When the page opens for the first time, a setup wizard will guide through the initial steps - connecting the Pico and optionally loading a 3D model.

---

## Technology Stack

### Hardware

**Raspberry Pi Pico + HX711** - the microcontroller reads data from HX711 analog-to-digital converters, which are the industry standard in digital scales. The Pico was chosen for its low cost, ease of programming in MicroPython, and native USB support. The HX711 operates at 24-bit resolution, which translates to very high measurement sensitivity.

The firmware uses a moving average with trimmed extremes (trimmed mean), which significantly reduces electrical noise without introducing noticeable latency.

### Web Layer

**React 19** - the library for building the user interface. Components automatically react to state changes, which is especially useful when handling a stream of data arriving dozens of times per second.

**Vite** - the build and development server tool. It offers near-instant cold start and hot module replacement without full page reloads.

**Tailwind CSS 4** - a styling utility. Instead of writing separate CSS files, styles are described directly alongside components using class names, which speeds up development and eliminates dead code.

**Zustand** - a minimal state management library. It holds current sensor readings, the recording history, the 3D mesh-to-sensor mapping configuration, and the connection status. Chosen over Redux for its significantly simpler API while retaining full capability.

**Web Serial API** - a native browser API (Chrome/Edge) enabling direct communication with USB devices without installing any drivers or extensions. The microcontroller sends JSON lines; the application parses them and updates the state.

**PeerJS** - a library that simplifies using WebRTC for peer-to-peer connections. It allows sharing a session with other devices via a QR code scan - telemetry data and the 3D model are transmitted directly between browsers, bypassing any server. Model binary data is serialized as `ArrayBuffer` to work around the JSON serialization limitations imposed by the library.

**Three.js + @react-three/fiber + @react-three/drei** - the trio of libraries powering the 3D engine. Three.js is the core renderer for the OpenGL scene inside a Canvas element. React Three Fiber bridges Three.js with the React component tree. Drei provides higher-level ready-made components such as `OrbitControls`, `Bounds` (automatic camera fitting to the model), and `ContactShadows`.

**Recharts** - an SVG-based charting library. Used to render the time-series load chart. A key requirement was the ability to disable animations (`isAnimationActive={false}`), which is essential when continuously streaming live data.

**SheetJS (xlsx)** - handles data export to the `.xlsx` format. It allows saving an entire recorded session to an Excel file with one click, without communicating with any server. The file is generated entirely in the browser.

**qrcode.react** - generates a QR code containing the session link. The link carries the P2P host identifier; scanning it on another device automatically establishes the connection.

**idb-keyval** - a simple abstraction over IndexedDB (the browser's local database). Used to persist 3D model files between sessions, so the model does not disappear on page refresh.

**Lucide React** - an SVG icon set. Provides a consistent icon style throughout the interface.

---

## Key Features

**Live telemetry** - once the Pico is connected, sensor cards update in real time. The display unit can be toggled between newtons and grams.

![Live telemetry panel with sensor cards and extreme values](./docs/leftside.png)

**Session recording** - the START/STOP button collects a reading history with 0.1-second precision. The side panel shows minimum and maximum values for each beam with an exact timestamp.

![Load dynamics chart during a measurement session](./docs/mainside.png)

**3D visualization** - the user imports a GLTF or GLB model (e.g. exported from Blender). After loading, clicking a mesh element assigns a sensor to it. The model then changes colors proportionally to the current load.

![3D preview panel showing the truss model with live force labels in newtons](./docs/rightside.png)

**Session sharing** - the host generates a QR code, guests open the link on a phone or another computer and see exactly what the host sees - telemetry data and the 3D model - without installing anything.

![Session sharing modal with QR code and P2P session ID](./docs/share.png)

**Excel export** - the recorded session is saved to a `.xlsx` file with columns for each sensor in both units.

**First-run wizard** - an interactive step-by-step guide appears the first time the application is opened.

---

## System Requirements

| Component | Minimum Requirement |
|---|---|
| Browser | Google Chrome or Microsoft Edge (Web Serial API) |
| Node.js | ≥ 18 |
| Host operating system | Windows, macOS, Linux |
| Microcontroller | Raspberry Pi Pico (RP2040) |
| ADC module | HX711 |

Firefox and Safari are not supported due to the absence of a Web Serial API implementation.

---

## Author

Project completed as part of the Teamwork course at Bialystok University of Technology. It combines elements of analog electronics (force measurement), microcontroller programming, and modern web engineering (React, Zustand, Three.js, WebRTC, WebGL).

---

## License

This project is licensed under the [MIT License](./LICENSE).
You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, provided that the original copyright notice and this permission notice are included in all copies or substantial portions of the software.

The software is provided **"as is"**, without warranty of any kind.
