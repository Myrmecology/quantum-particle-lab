// ⚡ QUANTUM PARTICLE LAB - MAIN CONTROLLER ⚡

class QuantumLab {
    constructor() {
        this.isInitialized = false;
        this.physics = null;
        this.ui = null;
        this.debugMode = false;
        
        console.log('🚀 Initializing Quantum Particle Lab...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize physics engine
            console.log('⚡ Starting Physics Engine...');
            const canvas = document.getElementById('particle-canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            this.physics = new QuantumPhysics(canvas);
            
            // Wait for UI to be initialized
            await this.waitForUI();
            
            // Set up communication between systems
            this.setupCommunication();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start background tasks
            this.startBackgroundTasks();
            
            console.log('✅ Quantum Particle Lab initialized successfully!');
            this.isInitialized = true;
            
            // Enable debug mode with Ctrl+Shift+D
            this.setupDebugMode();
            
        } catch (error) {
            console.error('❌ Failed to initialize Quantum Lab:', error);
            this.showErrorMessage(error.message);
        }
    }

    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    waitForUI() {
        return new Promise((resolve) => {
            const checkUI = () => {
                if (window.quantumUI) {
                    this.ui = window.quantumUI;
                    resolve();
                } else {
                    setTimeout(checkUI, 50);
                }
            };
            checkUI();
        });
    }

    setupCommunication() {
        // Connect UI controls to physics engine
        window.quantumLab = this; // Make available globally for UI callbacks
        
        // Override UI's emit method to send to physics
        const originalEmit = this.ui.emitControlChange;
        this.ui.emitControlChange = (changes) => {
            this.sendControlUpdate(changes);
        };
        
        console.log('🔗 Communication bridge established');
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Visibility change (pause when tab not visible)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Fullscreen toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
        
        console.log('👂 Event listeners configured');
    }

    startBackgroundTasks() {
        // Auto-optimization
        setInterval(() => {
            this.optimizePerformance();
        }, 5000);
        
        // Stats logging
        if (this.debugMode) {
            setInterval(() => {
                this.logStats();
            }, 10000);
        }
        
        console.log('⏰ Background tasks started');
    }

    // Communication methods
    sendControlUpdate(controls) {
        if (this.physics && this.physics.isConnected) {
            this.physics.sendControlUpdate(controls);
            
            // Apply any frontend-only effects
            this.applyFrontendEffects(controls);
        } else {
            console.warn('⚠️ Cannot send controls: Physics engine not connected');
        }
    }

    applyFrontendEffects(controls) {
        // Update render modes based on controls
        if (controls.gravity !== undefined) {
            if (controls.gravity > 0.5) {
                this.physics.setRenderMode('blackhole');
            } else if (controls.gravity < -0.1) {
                this.physics.setRenderMode('storm');
            }
        }
        
        // Create visual feedback for major changes
        if (controls.reset) {
            this.createResetEffect();
        }
        
        if (controls.particle_count && controls.particle_count > 1000) {
            console.log('⚡ High particle count detected, optimizing rendering...');
            this.physics.optimizeRendering();
        }
    }

    // Event handlers
    handleResize() {
        if (this.physics) {
            this.physics.resize();
        }
        
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            console.log('📐 Window resized, canvas updated');
        }, 250);
    }

    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ Tab hidden, reducing performance');
            this.reducePerformance();
        } else {
            console.log('👁️ Tab visible, restoring performance');
            this.restorePerformance();
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Cannot enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Performance optimization
    setupPerformanceMonitoring() {
        this.performanceMetrics = {
            frameDrops: 0,
            avgRenderTime: 0,
            memoryPeak: 0,
            lastOptimization: Date.now()
        };
        
        // Monitor frame drops
        let lastFrameTime = performance.now();
        const monitorFrames = () => {
            const now = performance.now();
            const frameDelta = now - lastFrameTime;
            
            if (frameDelta > 35) { // Frame drop detected (below 30 FPS)
                this.performanceMetrics.frameDrops++;
            }
            
            lastFrameTime = now;
            requestAnimationFrame(monitorFrames);
        };
        
        requestAnimationFrame(monitorFrames);
    }

    optimizePerformance() {
        if (!this.physics) return;
        
        const stats = this.physics.getStats();
        
        // Auto-optimize if FPS is low
        if (stats.fps < 30 && Date.now() - this.performanceMetrics.lastOptimization > 10000) {
            console.log('🎯 Auto-optimizing performance...');
            
            // Reduce particle effects
            this.physics.optimizeRendering();
            
            // Suggest reducing particle count
            if (this.ui && stats.particleCount > 800) {
                console.log('💡 Suggestion: Reduce particle count for better performance');
            }
            
            this.performanceMetrics.lastOptimization = Date.now();
        }
        
        // Monitor memory usage
        if (performance.memory) {
            const memUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            this.performanceMetrics.memoryPeak = Math.max(this.performanceMetrics.memoryPeak, memUsage);
            
            if (memUsage > 100) { // Over 100MB
                console.warn('⚠️ High memory usage detected:', memUsage.toFixed(1), 'MB');
            }
        }
    }

    reducePerformance() {
        // Reduce frame rate when tab is hidden
        if (this.physics) {
            this.physics.targetFPS = 10;
        }
    }

    restorePerformance() {
        // Restore normal frame rate
        if (this.physics) {
            this.physics.targetFPS = 60;
        }
    }

    // Visual effects
    createResetEffect() {
        const canvas = document.getElementById('particle-canvas');
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Create explosion effect at center
        this.physics.createExplosion(centerX, centerY, 30);
        
        // Flash effect
        this.createFlashEffect();
    }

    createFlashEffect() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 255, 255, 0.2);
            pointer-events: none;
            z-index: 9998;
            animation: flashFade 0.5s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 500);
        
        // Add flash animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes flashFade {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => style.remove(), 1000);
    }

    // Debug mode
    setupDebugMode() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                this.toggleDebugMode();
            }
        });
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        console.log(this.debugMode ? '🔍 Debug mode enabled' : '🔍 Debug mode disabled');
        
        if (this.debugMode) {
            this.showDebugPanel();
        } else {
            this.hideDebugPanel();
        }
    }

    showDebugPanel() {
        if (document.getElementById('debug-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 200px;
        `;
        
        document.body.appendChild(panel);
        
        // Update debug info every second
        this.updateDebugPanel();
        this.debugInterval = setInterval(() => {
            this.updateDebugPanel();
        }, 1000);
    }

    updateDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (!panel || !this.physics) return;
        
        const stats = this.physics.getStats();
        const memory = performance.memory ? 
            `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB` : 'N/A';
        
        panel.innerHTML = `
            <strong>QUANTUM LAB DEBUG</strong><br>
            FPS: ${stats.fps}<br>
            Render: ${stats.renderTime.toFixed(1)}ms<br>
            Particles: ${stats.particleCount}<br>
            Memory: ${memory}<br>
            Connected: ${stats.connected ? 'YES' : 'NO'}<br>
            Frame Drops: ${this.performanceMetrics.frameDrops}<br>
            Trail Length: ${stats.trailLength}<br>
            Glow: ${stats.glowIntensity.toFixed(1)}
        `;
    }

    hideDebugPanel() {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.remove();
        }
        
        if (this.debugInterval) {
            clearInterval(this.debugInterval);
        }
    }

    logStats() {
        if (!this.physics) return;
        
        const stats = this.physics.getStats();
        console.log('📊 Performance Stats:', {
            fps: stats.fps,
            renderTime: stats.renderTime,
            particles: stats.particleCount,
            frameDrops: this.performanceMetrics.frameDrops,
            memoryPeak: this.performanceMetrics.memoryPeak
        });
    }

    // Error handling
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: var(--quantum-font);
            text-align: center;
            z-index: 10001;
        `;
        errorDiv.innerHTML = `
            <h3>⚠️ SYSTEM ERROR</h3>
            <p>${message}</p>
            <button onclick="this.parentElement.remove()" 
                    style="background: rgba(255,255,255,0.2); border: 1px solid white; 
                           color: white; padding: 5px 15px; border-radius: 5px; cursor: pointer;">
                DISMISS
            </button>
        `;
        
        document.body.appendChild(errorDiv);
    }

    // Public API
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            connected: this.physics?.isConnected || false,
            particleCount: this.physics?.particles?.length || 0,
            fps: this.physics?.getStats()?.fps || 0,
            debugMode: this.debugMode
        };
    }

    restart() {
        console.log('🔄 Restarting Quantum Lab...');
        
        // Clean up existing instances
        if (this.physics) {
            this.physics.socket?.close();
        }
        
        // Reinitialize
        setTimeout(() => {
            this.initialize();
        }, 1000);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('🌟 Welcome to the Quantum Particle Lab!');
    console.log('🎮 Controls:');
    console.log('   - Mouse: Attract/Repel particles');
    console.log('   - Space: Pause/Resume');
    console.log('   - R: Reset simulation');
    console.log('   - 1-4: Preset modes');
    console.log('   - F11: Fullscreen');
    console.log('   - Ctrl+Shift+D: Debug mode');
    
    // Create main lab instance
    window.quantumLab = new QuantumLab();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.quantumLab?.physics?.socket) {
        window.quantumLab.physics.socket.close();
    }
});