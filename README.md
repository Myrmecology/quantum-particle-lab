⚡ Quantum Particle Lab ⚡

A mind-blowing real-time particle physics simulator with holographic UI and blazing-fast performance

✨ Features
🚀 Blazing Performance - Rust backend handles 2000+ particles at 60+ FPS
🎨 Holographic UI - Futuristic glassmorphism interface with neon effects
🖱️ Interactive Physics - Mouse controls gravity wells and particle attraction
⚡ Real-time Controls - Instant response sliders for all physics parameters
🎮 Preset Modes - Black Hole, Particle Storm, Fluid Sim, Zero-G
📱 Responsive Design - Works on desktop, tablet, and mobile
🔧 Performance Monitoring - Built-in FPS counter and optimization
🚀 Quick Start
Prerequisites

Rust (latest stable)
Web server: Python or Node.js or VS Code Live Server

Installation

Clone the repository
bashgit clone https://github.com/Myrmecology/quantum-particle-lab.git
cd quantum-particle-lab

Start the Physics Engine (Backend)
Open a terminal and run:
bashcd backend
cargo run
✅ Expected Output:
🚀 Quantum Particle Lab running on ws://127.0.0.1:8080
⚠️ IMPORTANT: Keep this terminal open! The physics engine must stay running.
Backend Troubleshooting:
bash# If you get compilation errors:
rustup update
cargo clean
cargo build
cargo run

# If port 8080 is busy, the app will show an error
# Kill any process using port 8080 or restart your computer

Launch the Frontend (Open a NEW terminal)
Choose one of these methods:
Option A: Python HTTP Server (Recommended)
bashcd frontend

# Try this first:
python -m http.server 3000 --bind 127.0.0.1

# If that doesn't work, try:
python -m http.server 8000 --bind 127.0.0.1

# On some systems, use python3:
python3 -m http.server 3000 --bind 127.0.0.1
Then open: http://127.0.0.1:3000 or http://127.0.0.1:8000
Option B: Node.js Serve
bashcd frontend

# Install serve globally (one time only):
npm install -g serve

# Start the server:
npx serve . -p 3000
# OR if you installed serve globally:
serve . -p 3000
Then open: http://localhost:3000
Option C: VS Code Live Server (Easiest)

Install the "Live Server" extension in VS Code
Right-click frontend/index.html in the file explorer
Select "Open with Live Server"
It will automatically open in your browser

Option D: Simple File Method (Basic)
bash# Navigate to the frontend folder
cd frontend

# Double-click index.html in your file explorer
# OR drag index.html directly into your browser
# OR open index.html with your browser
⚠️ Note: This method may have CORS issues with WebSocket connections.
Open in Browser
Primary URLs to try:

http://127.0.0.1:3000
http://localhost:3000
http://127.0.0.1:8000
http://localhost:8000

✅ Success indicators:

You see a loading screen with a spinning quantum atom
The interface loads with neon blue/magenta colors
You see "CONNECTED" in the top-right status panel
Particles are bouncing around the screen



🔧 Complete Startup Troubleshooting
Backend Issues
ProblemSolutionCompilation errorsrustup update && cargo clean && cargo buildPort 8080 busyRestart computer or kill process using portRust not installedInstall from rustup.rsPermission deniedRun terminal as administrator
Frontend Issues
ProblemSolution"Site cannot be reached"Use --bind 127.0.0.1 flag with PythonIPv6 address [::] shownForce IPv4: python -m http.server 3000 --bind 127.0.0.1Port already in useTry different port: python -m http.server 8000Python not foundTry python3 instead of pythonNode.js errorsInstall Node.js from nodejs.org
Connection Issues
ProblemSolution"DISCONNECTED" statusEnsure backend is running firstNo particles movingRefresh page, check browser console (F12)WebSocket errorsBackend must be on ws://127.0.0.1:8080Blank screenTry different browser or enable JavaScript
🎯 Quick Test Commands
Test Backend:
bash# This should show the WebSocket server running:
cd backend && cargo run
Test Frontend (Pick one):
bash# Python method:
cd frontend && python -m http.server 3000 --bind 127.0.0.1

# Node.js method:
cd frontend && npx serve . -p 3000

# VS Code method:
# Right-click index.html → "Open with Live Server"
🎮 Controls
InputActionMouse MoveAttract/repel particlesMouse ClickCreate energy burstSpacePause/ResumeRReset simulation1-4Quick presetsF11FullscreenCtrl+Shift+DDebug mode
🎛️ Physics Parameters

Gravity: -0.5 to 1.0 - Downward force strength
Bounce: 0.1 to 1.0 - Collision elasticity
Particles: 50 to 2000 - Active particle count
Mouse Force: -20 to 20 - Attraction/repulsion strength

🏗️ Architecture
quantum-particle-lab/
├── 🦀 backend/          # Rust WebSocket physics engine
│   ├── src/main.rs      # Core physics & particle simulation
│   └── Cargo.toml       # Dependencies
└── 🌐 frontend/         # JavaScript visualization
    ├── index.html       # UI structure
    ├── styles/          # Holographic CSS
    └── js/             # Canvas rendering & controls
📊 Performance
ParticlesFPSRender TimeMemory50060+~8ms~25MB100055+~12ms~35MB150045+~18ms~45MB200035+~25ms~55MB
Tested on modern hardware with dedicated graphics
🛠️ Development
Adding Custom Presets
javascript// frontend/js/ui.js
const presets = {
    mypreset: {
        gravity: 0.2,
        bounce: 0.8,
        mouseForce: 10,
        particles: 1000
    }
};
Modifying Particle Colors
rust// backend/src/main.rs  
let colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4"];
Building for Production
bash# Backend
cd backend
cargo build --release

# Frontend - serve static files
cd frontend
# Deploy to your preferred hosting platform
🤝 Contributing
We love contributions! Here's how to get started:

🍴 Fork the repository
🌿 Create your feature branch: git checkout -b feature/amazing-feature
💾 Commit your changes: git commit -m 'Add amazing feature'
📤 Push to the branch: git push origin feature/amazing-feature
🔄 Open a Pull Request

Development Guidelines

Follow Rust formatting: cargo fmt
Test with 1000+ particles before submitting
Maintain the quantum/holographic visual theme
Add comments for complex physics calculations

🐛 Troubleshooting
<details>
<summary><strong>Backend won't start</strong></summary>
bash# Update Rust
rustup update

# Clean rebuild
cd backend
cargo clean && cargo build
</details>
<details>
<summary><strong>Frontend connection failed</strong></summary>

Ensure backend is running on ws://localhost:8080
Check browser console for WebSocket errors
Try a different web server (Python vs Node.js)

</details>
<details>
<summary><strong>Poor performance</strong></summary>

Reduce particle count with the slider
Enable hardware acceleration in browser settings
Close other browser tabs
Press Ctrl+Shift+D for debug info

</details>
🚀 Future Roadmap

 🎨 WebGL shaders for advanced effects
 🎵 Audio visualization with Web Audio API
 🥽 VR support for immersive interaction
 🎬 Export animations as video files
 🌐 Multiplayer synchronized environments
 📐 3D particle physics with Three.js

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

Rust community for exceptional performance
Tokio for async WebSocket handling
Modern CSS features for holographic effects
Physics simulation research and algorithms

⭐ Support
If you found this project helpful, please consider:

⭐ Starring the repository
🍴 Forking for your own experiments
🐛 Reporting any issues you find
💡 Suggesting new features


⚡ Built with Quantum Precision ⚡
Made with ❤️ and ☕ by Justin D.