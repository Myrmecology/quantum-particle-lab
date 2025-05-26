// ⚡ QUANTUM PARTICLE LAB - FRONTEND PHYSICS & RENDERING ⚡

class QuantumPhysics {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isConnected = false;
        this.socket = null;
        
        this.renderStats = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 60,
            renderTime: 0
        };
        
        this.trailLength = 8;
        this.glowIntensity = 1.0;
        this.particleSize = 3;
        
        this.initializeCanvas();
        this.connectToBackend();
        this.startRenderLoop();
    }

    initializeCanvas() {
        // Set canvas size
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Set rendering context properties
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Set initial background
        this.clearCanvas();
    }

    connectToBackend() {
        try {
            this.socket = new WebSocket('ws://localhost:8080');
            
            this.socket.onopen = () => {
                console.log('🚀 Connected to Quantum Physics Engine');
                this.isConnected = true;
                if (window.quantumUI) {
                    window.quantumUI.updateConnectionStatus(true);
                }
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.updateParticles(data);
                } catch (error) {
                    console.error('Error parsing physics data:', error);
                }
            };
            
            this.socket.onclose = () => {
                console.log('❌ Disconnected from Physics Engine');
                this.isConnected = false;
                if (window.quantumUI) {
                    window.quantumUI.updateConnectionStatus(false);
                }
                
                // Attempt to reconnect after 3 seconds
                setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    this.connectToBackend();
                }, 3000);
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('Failed to connect to backend:', error);
        }
    }

    updateParticles(simulationData) {
        this.particles = simulationData.particles || [];
        
        // Update UI with particle count
        if (window.quantumUI) {
            window.quantumUI.updateParticleCount(this.particles.length);
        }
    }

    sendControlUpdate(controls) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(controls));
        }
    }

    startRenderLoop() {
        const render = (currentTime) => {
            const deltaTime = currentTime - this.renderStats.lastTime;
            this.renderStats.lastTime = currentTime;
            
            // Calculate FPS
            this.renderStats.frameCount++;
            if (this.renderStats.frameCount % 60 === 0) {
                this.renderStats.fps = Math.round(1000 / deltaTime);
            }
            
            // Measure render time
            const renderStart = performance.now();
            this.render();
            this.renderStats.renderTime = performance.now() - renderStart;
            
            requestAnimationFrame(render);
        };
        
        requestAnimationFrame(render);
    }

    render() {
        // Clear canvas with slight trail effect for better visuals
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set composite operation for glowing effect
        this.ctx.globalCompositeOperation = 'screen';
        
        // Render particles
        for (const particle of this.particles) {
            this.renderParticle(particle);
        }
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
    }

    renderParticle(particle) {
        const x = particle.x;
        const y = particle.y;
        const color = particle.color;
        const size = this.particleSize * particle.mass;
        
        // Render particle trail
        if (particle.trail && particle.trail.length > 1) {
            this.renderTrail(particle.trail, color);
        }
        
        // Render main particle with glow effect
        this.renderParticleGlow(x, y, size, color);
        this.renderParticleCore(x, y, size * 0.6, color);
    }

    renderTrail(trail, color) {
        if (trail.length < 2) return;
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Create gradient along trail
        for (let i = 1; i < trail.length; i++) {
            const alpha = (i / trail.length) * 0.3;
            this.ctx.globalAlpha = alpha;
            
            this.ctx.beginPath();
            this.ctx.moveTo(trail[i-1][0], trail[i-1][1]);
            this.ctx.lineTo(trail[i][0], trail[i][1]);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    renderParticleGlow(x, y, size, color) {
        // Outer glow
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        gradient.addColorStop(0, this.hexToRgba(color, 0.3));
        gradient.addColorStop(0.3, this.hexToRgba(color, 0.1));
        gradient.addColorStop(1, this.hexToRgba(color, 0));
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner glow
        const innerGradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
        innerGradient.addColorStop(0, this.hexToRgba(color, 0.6));
        innerGradient.addColorStop(0.5, this.hexToRgba(color, 0.3));
        innerGradient.addColorStop(1, this.hexToRgba(color, 0));
        
        this.ctx.fillStyle = innerGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    renderParticleCore(x, y, size, color) {
        // Core particle
        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = size * 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bright center
        this.ctx.fillStyle = this.lightenColor(color, 0.5);
        this.ctx.shadowBlur = 0;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    // Utility functions
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    lightenColor(color, factor) {
        // Convert hex to RGB
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // Lighten
        const newR = Math.min(255, Math.round(r + (255 - r) * factor));
        const newG = Math.min(255, Math.round(g + (255 - g) * factor));
        const newB = Math.min(255, Math.round(b + (255 - b) * factor));
        
        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    clearCanvas() {
        // Create subtle background gradient
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, 
            Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0, 'rgba(0, 20, 40, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Special rendering modes
    setRenderMode(mode) {
        switch(mode) {
            case 'blackhole':
                this.trailLength = 15;
                this.glowIntensity = 2.0;
                this.particleSize = 2;
                break;
            case 'storm':
                this.trailLength = 5;
                this.glowIntensity = 1.5;
                this.particleSize = 4;
                break;
            case 'fluid':
                this.trailLength = 10;
                this.glowIntensity = 0.8;
                this.particleSize = 3;
                break;
            case 'zero-g':
                this.trailLength = 20;
                this.glowIntensity = 1.2;
                this.particleSize = 2.5;
                break;
            default:
                this.trailLength = 8;
                this.glowIntensity = 1.0;
                this.particleSize = 3;
        }
    }

    // Performance optimization methods
    optimizeRendering() {
        // Reduce particle count if FPS drops
        if (this.renderStats.fps < 30 && this.particles.length > 500) {
            console.log('⚡ Optimizing performance: reducing visual effects');
            this.trailLength = Math.max(3, this.trailLength - 1);
            this.glowIntensity = Math.max(0.5, this.glowIntensity - 0.1);
        }
    }

    // Resize handling
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.initializeCanvas();
    }

    // Debug methods
    getStats() {
        return {
            fps: this.renderStats.fps,
            renderTime: this.renderStats.renderTime,
            particleCount: this.particles.length,
            connected: this.isConnected,
            trailLength: this.trailLength,
            glowIntensity: this.glowIntensity
        };
    }

    // Special effects
    createExplosion(x, y, particleCount = 20) {
        const explosionParticles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 5 + Math.random() * 10;
            
            explosionParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1.0,
                color: '#ffff00',
                size: 2 + Math.random() * 3
            });
        }
        
        this.animateExplosion(explosionParticles);
    }

    animateExplosion(explosionParticles) {
        const animate = () => {
            this.ctx.globalCompositeOperation = 'screen';
            
            for (let i = explosionParticles.length - 1; i >= 0; i--) {
                const p = explosionParticles[i];
                
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98;
                p.vy *= 0.98;
                p.life -= 0.02;
                
                // Render particle
                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = p.size * 2;
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Remove dead particles
                if (p.life <= 0) {
                    explosionParticles.splice(i, 1);
                }
            }
            
            this.ctx.globalAlpha = 1.0;
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.globalCompositeOperation = 'source-over';
            
            if (explosionParticles.length > 0) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Export for use in main.js
window.QuantumPhysics = QuantumPhysics;