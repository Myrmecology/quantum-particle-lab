// ⚡ QUANTUM PARTICLE LAB - UI CONTROLLER ⚡

class QuantumUI {
    constructor() {
        this.isConnected = false;
        this.isPaused = false;
        this.currentPreset = null;
        this.performanceStats = {
            fps: 60,
            renderTime: 16,
            physicsTime: 8,
            memoryUsage: 24
        };
        
        this.initializeElements();
        this.bindEvents();
        this.startPerformanceMonitoring();
        this.showLoadingScreen();
    }

    initializeElements() {
        // Sliders
        this.gravitySlider = document.getElementById('gravity-slider');
        this.bounceSlider = document.getElementById('bounce-slider');
        this.particlesSlider = document.getElementById('particles-slider');
        this.mouseForceSlider = document.getElementById('mouse-force-slider');
        
        // Value displays
        this.gravityValue = document.getElementById('gravity-value');
        this.bounceValue = document.getElementById('bounce-value');
        this.particlesValue = document.getElementById('particles-value');
        this.mouseForceValue = document.getElementById('mouse-force-value');
        
        // Status elements
        this.particleCountStatus = document.getElementById('particle-count');
        this.fpsStatus = document.getElementById('fps');
        this.connectionStatus = document.getElementById('connection-status');
        
        // Performance elements
        this.renderTimeEl = document.getElementById('render-time');
        this.physicsTimeEl = document.getElementById('physics-time');
        this.memoryUsageEl = document.getElementById('memory-usage');
        
        // Control buttons
        this.resetBtn = document.getElementById('reset-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.presetBtns = document.querySelectorAll('.preset-btn');
        
        // Canvas elements
        this.canvasContainer = document.querySelector('.canvas-container');
        this.canvas = document.getElementById('particle-canvas');
        
        // Loading screen
        this.loadingScreen = document.getElementById('loading-screen');
    }

    bindEvents() {
        // Slider events
        this.gravitySlider.addEventListener('input', (e) => this.updateSliderValue(e, this.gravityValue));
        this.bounceSlider.addEventListener('input', (e) => this.updateSliderValue(e, this.bounceValue));
        this.particlesSlider.addEventListener('input', (e) => this.updateSliderValue(e, this.particlesValue));
        this.mouseForceSlider.addEventListener('input', (e) => this.updateSliderValue(e, this.mouseForceValue));
        
        // Button events
        this.resetBtn.addEventListener('click', () => this.handleReset());
        this.pauseBtn.addEventListener('click', () => this.handlePause());
        
        // Preset buttons
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePreset(e.target.dataset.preset));
        });
        
        // Canvas mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    updateSliderValue(event, valueElement) {
        let value = parseFloat(event.target.value);
        
        // Special handling for particle count (should be integer)
        if (event.target.id === 'particles-slider') {
            value = Math.round(value);
            valueElement.textContent = value.toString();
        } else {
            valueElement.textContent = value.toFixed(2);
        }
        
        // Add visual feedback
        this.addSliderGlow(event.target);
        
        // Fix parameter name mapping
        let paramName = event.target.id.replace('-slider', '').replace('-', '_');
        if (paramName === 'particles') {
            paramName = 'particle_count'; // Fix the naming mismatch
        }
        
        // Emit change event for physics engine
        this.emitControlChange({
            [paramName]: value
        });
    }

    addSliderGlow(slider) {
        slider.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.8)';
        setTimeout(() => {
            slider.style.boxShadow = '';
        }, 200);
    }

    handleReset() {
        this.addButtonEffect(this.resetBtn);
        this.emitControlChange({ reset: true });
        this.showSimulationMode('RESET', 2000);
        this.createEnergyBurst(this.resetBtn);
    }

    handlePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '▶ RESUME' : '⏸ PAUSE';
        this.canvasContainer.classList.toggle('paused', this.isPaused);
        this.addButtonEffect(this.pauseBtn);
    }

    handlePreset(preset) {
        // Clear previous active preset
        this.presetBtns.forEach(btn => btn.classList.remove('active'));
        
        // Set new active preset
        const activeBtn = document.querySelector(`[data-preset=\"${preset}\"]`);
        activeBtn.classList.add('active');
        this.currentPreset = preset;
        
        // Apply preset values
        const presets = {
            blackhole: {
                gravity: 0.3,
                bounce: 0.2,
                mouseForce: 15,
                particles: 1000
            },
            storm: {
                gravity: -0.2,
                bounce: 1.0,
                mouseForce: -10,
                particles: 1500
            },
            fluid: {
                gravity: 0.05,
                bounce: 0.9,
                mouseForce: 8,
                particles: 800
            },
            'zero-g': {
                gravity: 0.0,
                bounce: 1.0,
                mouseForce: 5,
                particles: 600
            }
        };
        
        const config = presets[preset];
        if (config) {
            this.applyPresetConfig(config);
            this.showSimulationMode(preset.toUpperCase().replace('-', ' '), 3000);
        }
        
        this.addButtonEffect(activeBtn);
    }

    applyPresetConfig(config) {
        // Update sliders
        this.gravitySlider.value = config.gravity;
        this.bounceSlider.value = config.bounce;
        this.mouseForceSlider.value = config.mouseForce;
        this.particlesSlider.value = config.particles;
        
        // Update displays
        this.gravityValue.textContent = config.gravity.toFixed(2);
        this.bounceValue.textContent = config.bounce.toFixed(2);
        this.mouseForceValue.textContent = config.mouseForce.toFixed(1);
        this.particlesValue.textContent = config.particles;
        
        // Send to physics engine
        this.emitControlChange({
            gravity: config.gravity,
            bounce: config.bounce,
            mouse_force: config.mouseForce,
            particle_count: config.particles
        });
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (this.canvas.height / rect.height);
        
        // Update mouse field indicator
        this.updateMouseField(x, y);
        
        // Send mouse position to physics engine
        this.emitControlChange({
            mouse_x: x,
            mouse_y: y
        });
    }

    handleMouseEnter() {
        this.showMouseField(true);
        this.canvasContainer.classList.add('attracting');
    }

    handleMouseLeave() {
        this.showMouseField(false);
        this.canvasContainer.classList.remove('attracting', 'repelling');
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.createRippleEffect(x, y);
        this.createEnergyBurst(event.target, x, y);
    }

    handleKeyboard(event) {
        switch(event.key) {
            case ' ': // Spacebar
                event.preventDefault();
                this.handlePause();
                break;
            case 'r':
            case 'R':
                this.handleReset();
                break;
            case '1':
                this.handlePreset('blackhole');
                break;
            case '2':
                this.handlePreset('storm');
                break;
            case '3':
                this.handlePreset('fluid');
                break;
            case '4':
                this.handlePreset('zero-g');
                break;
        }
    }

    handleResize() {
        // Update canvas size
        const rect = this.canvasContainer.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    // Visual effects methods
    updateMouseField(x, y) {
        let mouseField = document.querySelector('.mouse-field');
        if (!mouseField) {
            mouseField = document.createElement('div');
            mouseField.className = 'mouse-field';
            this.canvasContainer.appendChild(mouseField);
        }
        
        const size = Math.abs(parseFloat(this.mouseForceSlider.value)) * 10 + 20;
        mouseField.style.left = x + 'px';
        mouseField.style.top = y + 'px';
        mouseField.style.width = size + 'px';
        mouseField.style.height = size + 'px';
        
        // Change color based on force direction
        const force = parseFloat(this.mouseForceSlider.value);
        if (force > 0) {
            mouseField.style.borderColor = 'var(--neon-cyan)';
            mouseField.style.background = 'radial-gradient(circle, rgba(0, 255, 255, 0.1), transparent 60%)';
            this.canvasContainer.classList.remove('repelling');
            this.canvasContainer.classList.add('attracting');
        } else {
            mouseField.style.borderColor = 'var(--neon-magenta)';
            mouseField.style.background = 'radial-gradient(circle, rgba(255, 0, 255, 0.1), transparent 60%)';
            this.canvasContainer.classList.remove('attracting');
            this.canvasContainer.classList.add('repelling');
        }
    }

    showMouseField(show) {
        const mouseField = document.querySelector('.mouse-field');
        if (mouseField) {
            mouseField.classList.toggle('active', show);
        }
    }

    createRippleEffect(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'quantum-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        this.canvasContainer.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createEnergyBurst(element, x = null, y = null) {
        for (let i = 0; i < 5; i++) {
            const burst = document.createElement('div');
            burst.className = 'energy-burst';
            
            if (x !== null && y !== null) {
                burst.style.left = (x + Math.random() * 20 - 10) + 'px';
                burst.style.top = (y + Math.random() * 20 - 10) + 'px';
                this.canvasContainer.appendChild(burst);
            } else {
                const rect = element.getBoundingClientRect();
                burst.style.left = (rect.left + rect.width/2 + Math.random() * 20 - 10) + 'px';
                burst.style.top = (rect.top + rect.height/2 + Math.random() * 20 - 10) + 'px';
                document.body.appendChild(burst);
            }
            
            setTimeout(() => {
                burst.remove();
            }, 800);
        }
    }

    addButtonEffect(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    showSimulationMode(mode, duration = 3000) {
        let overlay = document.querySelector('.simulation-mode-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'simulation-mode-overlay';
            this.canvasContainer.appendChild(overlay);
        }
        
        overlay.textContent = `MODE: ${mode}`;
        overlay.className = `simulation-mode-overlay ${mode.toLowerCase().replace(' ', '')} visible`;
        
        setTimeout(() => {
            overlay.classList.remove('visible');
        }, duration);
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceStats();
        }, 1000);
    }

    updatePerformanceStats() {
        // Simulate performance metrics (in real app, these would come from actual measurements)
        this.performanceStats.fps = Math.round(55 + Math.random() * 10);
        this.performanceStats.renderTime = Math.round(12 + Math.random() * 8);
        this.performanceStats.physicsTime = Math.round(6 + Math.random() * 4);
        this.performanceStats.memoryUsage = Math.round(20 + Math.random() * 10);
        
        // Update displays
        this.fpsStatus.textContent = this.performanceStats.fps;
        this.renderTimeEl.textContent = this.performanceStats.renderTime + 'ms';
        this.physicsTimeEl.textContent = this.performanceStats.physicsTime + 'ms';
        this.memoryUsageEl.textContent = this.performanceStats.memoryUsage + 'MB';
        
        // Update performance colors
        this.updatePerformanceColors();
    }

    updatePerformanceColors() {
        // FPS coloring
        this.fpsStatus.className = 'status-value';
        if (this.performanceStats.fps >= 55) this.fpsStatus.classList.add('excellent');
        else if (this.performanceStats.fps >= 45) this.fpsStatus.classList.add('good');
        else if (this.performanceStats.fps >= 30) this.fpsStatus.classList.add('warning');
        else this.fpsStatus.classList.add('critical');
        
        // Render time coloring
        this.renderTimeEl.className = 'perf-value';
        if (this.performanceStats.renderTime <= 16) this.renderTimeEl.classList.add('excellent');
        else if (this.performanceStats.renderTime <= 25) this.renderTimeEl.classList.add('good');
        else if (this.performanceStats.renderTime <= 35) this.renderTimeEl.classList.add('warning');
        else this.renderTimeEl.classList.add('critical');
    }

    // Connection status
    updateConnectionStatus(connected) {
        this.isConnected = connected;
        this.connectionStatus.textContent = connected ? 'CONNECTED' : 'DISCONNECTED';
        this.connectionStatus.className = connected ? 'status-value connected' : 'status-value';
    }

    updateParticleCount(count) {
        this.particleCountStatus.textContent = count;
    }

    // Loading screen
    showLoadingScreen() {
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 3000);
    }

    hideLoadingScreen() {
        this.loadingScreen.classList.add('hidden');
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 500);
    }

    // Communication with physics engine
    emitControlChange(changes) {
        // This will be called by the main controller
        if (window.quantumLab && window.quantumLab.sendControlUpdate) {
            window.quantumLab.sendControlUpdate(changes);
        }
    }
}

// Initialize UI when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.quantumUI = new QuantumUI();
    });
} else {
    window.quantumUI = new QuantumUI();
}