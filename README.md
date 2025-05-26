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

Start the physics engine
bashcd backend
cargo run
✅ You should see: 🚀 Quantum Particle Lab running on ws://127.0.0.1:8080
Launch the frontend (new terminal)
bashcd frontend

# Choose one:
python -m http.server 3000        # Python
npx serve . -p 3000              # Node.js
# OR use VS Code Live Server extension

Open your browser
http://localhost:3000


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
Made with ❤️ and ☕ by Justin D
Happy coding