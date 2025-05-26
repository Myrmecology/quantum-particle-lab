use std::sync::Arc;
use tokio::sync::Mutex;
use tokio_tungstenite::{accept_async, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use rand::Rng;
use tokio::net::{TcpListener, TcpStream};

#[derive(Clone, Debug, Serialize, Deserialize)]
struct Particle {
    id: usize,
    x: f64,
    y: f64,
    vx: f64,
    vy: f64,
    mass: f64,
    color: String,
    trail: Vec<(f64, f64)>,
}

#[derive(Serialize, Deserialize)]
struct SimulationState {
    particles: Vec<Particle>,
    gravity: f64,
    bounce: f64,
    particle_count: usize,
    mouse_x: f64,
    mouse_y: f64,
    mouse_force: f64,
    paused: bool,
}

#[derive(Deserialize)]
struct ControlUpdate {
    gravity: Option<f64>,
    bounce: Option<f64>,
    particle_count: Option<usize>,
    mouse_x: Option<f64>,
    mouse_y: Option<f64>,
    mouse_force: Option<f64>,
    reset: Option<bool>,
    paused: Option<bool>,
}

struct PhysicsEngine {
    state: Arc<Mutex<SimulationState>>,
}

impl PhysicsEngine {
    fn new() -> Self {
        let mut particles = Vec::new();
        let mut rng = rand::thread_rng();
        
        // Create initial particles with cosmic colors
        for i in 0..500 {
            let colors = ["#00ffff", "#ff00ff", "#ffff00", "#ff4444", "#44ff44", "#4444ff"];
            particles.push(Particle {
                id: i,
                x: rng.gen_range(50.0..1200.0),
                y: rng.gen_range(50.0..600.0),
                vx: rng.gen_range(-2.0..2.0),
                vy: rng.gen_range(-2.0..2.0),
                mass: rng.gen_range(0.5..2.0),
                color: colors[rng.gen_range(0..colors.len())].to_string(),
                trail: Vec::new(),
            });
        }

        Self {
            state: Arc::new(Mutex::new(SimulationState {
                particles,
                gravity: 0.1,
                bounce: 0.8,
                particle_count: 500,
                mouse_x: 600.0,
                mouse_y: 300.0,
                mouse_force: 5.0,
                paused: false,
            })),
        }
    }

    async fn update_physics(&self) {
        let mut state = self.state.lock().await;
        
        // Don't update physics if paused
        if state.paused {
            return;
        }
        
        let width = 1200.0;
        let height = 600.0;

        // Extract values to avoid borrowing conflicts
        let mouse_x = state.mouse_x;
        let mouse_y = state.mouse_y;
        let mouse_force = state.mouse_force;
        let gravity = state.gravity;
        let bounce = state.bounce;

        for particle in &mut state.particles {
            // Add to trail
            particle.trail.push((particle.x, particle.y));
            if particle.trail.len() > 10 {
                particle.trail.remove(0);
            }

            // Mouse attraction/repulsion
            let dx = mouse_x - particle.x;
            let dy = mouse_y - particle.y;
            let distance = (dx * dx + dy * dy).sqrt().max(1.0);
            
            let force = mouse_force / (distance * distance) * 1000.0;
            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;

            // Apply gravity
            particle.vy += gravity;

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary collisions with bounce
            if particle.x <= 0.0 || particle.x >= width {
                particle.vx *= -bounce;
                particle.x = particle.x.clamp(0.0, width);
            }
            if particle.y <= 0.0 || particle.y >= height {
                particle.vy *= -bounce;
                particle.y = particle.y.clamp(0.0, height);
            }

            // Velocity damping for stability
            particle.vx *= 0.999;
            particle.vy *= 0.999;
        }

        // Particle-to-particle interactions (simplified)
        for i in 0..state.particles.len() {
            for j in (i + 1)..state.particles.len() {
                let dx = state.particles[j].x - state.particles[i].x;
                let dy = state.particles[j].y - state.particles[i].y;
                let distance = (dx * dx + dy * dy).sqrt();

                if distance < 20.0 && distance > 0.0 {
                    let force = 0.5 / distance;
                    let fx = (dx / distance) * force;
                    let fy = (dy / distance) * force;

                    state.particles[i].vx -= fx;
                    state.particles[i].vy -= fy;
                    state.particles[j].vx += fx;
                    state.particles[j].vy += fy;
                }
            }
        }
    }

    async fn reset_particles(&self) {
        let mut state = self.state.lock().await;
        let mut rng = rand::thread_rng();
        let colors = ["#00ffff", "#ff00ff", "#ffff00", "#ff4444", "#44ff44", "#4444ff"];

        state.particles.clear();
        for i in 0..state.particle_count {
            state.particles.push(Particle {
                id: i,
                x: rng.gen_range(50.0..1150.0),
                y: rng.gen_range(50.0..550.0),
                vx: rng.gen_range(-1.0..1.0),
                vy: rng.gen_range(-1.0..1.0),
                mass: rng.gen_range(0.5..2.0),
                color: colors[rng.gen_range(0..colors.len())].to_string(),
                trail: Vec::new(),
            });
        }
    }
}

async fn handle_connection(stream: TcpStream, engine: Arc<PhysicsEngine>) {
    let ws_stream = accept_async(stream).await.expect("WebSocket handshake failed");
    let (ws_sender, mut ws_receiver) = ws_stream.split();

    // Physics update loop
    let engine_clone = engine.clone();
    let sender_clone = Arc::new(Mutex::new(ws_sender));
    
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(16)); // ~60 FPS
        
        loop {
            interval.tick().await;
            engine_clone.update_physics().await;
            
            let state = engine_clone.state.lock().await;
            let json = serde_json::to_string(&*state).unwrap();
            
            let mut sender = sender_clone.lock().await;
            if sender.send(Message::Text(json)).await.is_err() {
                break;
            }
        }
    });

    // Handle control messages
    while let Some(msg) = ws_receiver.next().await {
        if let Ok(Message::Text(text)) = msg {
            if let Ok(update) = serde_json::from_str::<ControlUpdate>(&text) {
                let mut state = engine.state.lock().await;
                
                if let Some(gravity) = update.gravity {
                    state.gravity = gravity;
                }
                if let Some(bounce) = update.bounce {
                    state.bounce = bounce;
                }
                if let Some(count) = update.particle_count {
                    state.particle_count = count;
                    // Actually resize the particles array
                    let current_count = state.particles.len();
                    
                    if count > current_count {
                        // Add more particles
                        let mut rng = rand::thread_rng();
                        let colors = ["#00ffff", "#ff00ff", "#ffff00", "#ff4444", "#44ff44", "#4444ff"];
                        
                        for i in current_count..count {
                            state.particles.push(Particle {
                                id: i,
                                x: rng.gen_range(50.0..1150.0),
                                y: rng.gen_range(50.0..550.0),
                                vx: rng.gen_range(-1.0..1.0),
                                vy: rng.gen_range(-1.0..1.0),
                                mass: rng.gen_range(0.5..2.0),
                                color: colors[rng.gen_range(0..colors.len())].to_string(),
                                trail: Vec::new(),
                            });
                        }
                    } else if count < current_count {
                        // Remove excess particles
                        state.particles.truncate(count);
                    }
                }
                if let Some(x) = update.mouse_x {
                    state.mouse_x = x;
                }
                if let Some(y) = update.mouse_y {
                    state.mouse_y = y;
                }
                if let Some(force) = update.mouse_force {
                    state.mouse_force = force;
                }
                if let Some(pause_state) = update.paused {
                    state.paused = pause_state;
                }
                if update.reset == Some(true) {
                    drop(state);
                    engine.reset_particles().await;
                }
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let addr = "127.0.0.1:8080";
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    let engine = Arc::new(PhysicsEngine::new());

    println!("🚀 Quantum Particle Lab running on ws://{}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        let engine_clone = engine.clone();
        tokio::spawn(handle_connection(stream, engine_clone));
    }
}