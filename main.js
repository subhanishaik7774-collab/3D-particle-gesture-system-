import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ============================================
// Configuration
// ============================================
const CONFIG = {
    particleCount: 8000,
    particleSize: 3,
    animationSpeed: 1,
    currentTemplate: 'solarsystem',
    currentColor: 'rainbow',
    trackingEnabled: true,
    autoRotate: true,
    expansionFactor: 1,
    targetExpansion: 1,
    gestureTimeout: 500,
    bloomIntensity: 1.2,
    bloomRadius: 0.8,
    bloomThreshold: 0.1
};

// Color Palettes
const COLOR_PALETTES = {
    rainbow: [
        new THREE.Color(0xff0000),
        new THREE.Color(0xff7f00),
        new THREE.Color(0xffff00),
        new THREE.Color(0x00ff00),
        new THREE.Color(0x0000ff),
        new THREE.Color(0x8b00ff)
    ],
    fire: [
        new THREE.Color(0xff0000),
        new THREE.Color(0xff4500),
        new THREE.Color(0xff7f00),
        new THREE.Color(0xffa500),
        new THREE.Color(0xffff00)
    ],
    ice: [
        new THREE.Color(0x00ffff),
        new THREE.Color(0x00bfff),
        new THREE.Color(0x0080ff),
        new THREE.Color(0x0040ff),
        new THREE.Color(0x0000ff)
    ],
    nature: [
        new THREE.Color(0x00ff00),
        new THREE.Color(0x32cd32),
        new THREE.Color(0x228b22),
        new THREE.Color(0x90ee90),
        new THREE.Color(0x98fb98)
    ],
    sunset: [
        new THREE.Color(0xff6b6b),
        new THREE.Color(0xffa500),
        new THREE.Color(0xff69b4),
        new THREE.Color(0xff1493),
        new THREE.Color(0xffd700)
    ],
    neon: [
        new THREE.Color(0xff00ff),
        new THREE.Color(0x00ffff),
        new THREE.Color(0xffff00),
        new THREE.Color(0x00ff00),
        new THREE.Color(0xff0080)
    ]
};

// Template list for cycling (19 templates!)
const TEMPLATES = [
    'solarsystem', 'sphere', 'heart', 'flower', 'saturn', 'firework', 'galaxy', 'dna', 'star',
    'cube', 'cone', 'torus', 'icosahedron', 'spiral', 'wave', 'helix',
    'crystal', 'lattice', 'vortex', 'ring'
];

// ============================================
// Gesture Configuration System
// ============================================
const GESTURE_CONFIG = {
    palm: {
        name: 'Open Palm',
        icon: '✋',
        action: 'expand',
        cooldown: 100
    },
    fist: {
        name: 'Closed Fist',
        icon: '✊',
        action: 'contract',
        cooldown: 100
    },
    point: {
        name: 'Point Up',
        icon: '☝️',
        action: 'nextTemplate',
        cooldown: 300
    },
    peace: {
        name: 'Peace Sign',
        icon: '✌️',
        action: 'nextColor',
        cooldown: 300
    },
    rock: {
        name: 'Rock Sign',
        icon: '🤟',
        action: 'fireworks',
        cooldown: 500
    },
    thumbsup: {
        name: 'Thumbs Up',
        icon: '👍',
        action: 'speedUp',
        cooldown: 300
    },
    ok: {
        name: 'OK Sign',
        icon: '👌',
        action: 'reset',
        cooldown: 500
    },
    thumbsdown: {
        name: 'Thumbs Down',
        icon: '👎',
        action: 'previousTemplate',
        cooldown: 300
    },
    victory: {
        name: 'Victory Sign',
        icon: '✌️',
        action: 'speedDown',
        cooldown: 300
    },
    grabbing: {
        name: 'Grab Gesture',
        icon: '🤏',
        action: 'toggleAutoRotate',
        cooldown: 300
    },
    wavehand: {
        name: 'Wave Hand',
        icon: '👋',
        action: 'randomTemplate',
        cooldown: 500
    },
    pinch: {
        name: 'Pinch',
        icon: '🤌',
        action: 'toggleTracking',
        cooldown: 300
    }
};

// ============================================
// Global Variables
// ============================================
let scene, camera, renderer, controls, composer;
let particles, particleGeometry, particleMaterial;
let originalPositions = [];
let targetPositions = [];
let velocities = [];
let handTracker = null;
let lastGestureTime = 0;
let currentGesture = 'none';
let isFireworkBurst = false;
let fireworkProgress = 0;
let clock = new THREE.Clock();
let frameCount = 0;
let lastFPSUpdate = 0;
let solarSystemBodies = [];
let nebulaeParticles = [];
let trailPoints = [];

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loadingStatus = document.getElementById('loading-status');
const particleCountEl = document.getElementById('particle-count');
const fpsCounterEl = document.getElementById('fps-counter');
const gestureIconEl = document.getElementById('gesture-icon');
const gestureNameEl = document.getElementById('gesture-name');
const cameraFeed = document.getElementById('camera-feed');
const handCanvas = document.getElementById('hand-canvas');
const handCtx = handCanvas.getContext('2d');

// ============================================
// Initialization
// ============================================
async function init() {
    try {
        updateLoadingStatus('Initializing Three.js...');
        initThreeJS();
        
        updateLoadingStatus('Creating particle system...');
        await createParticleSystem();
        
        updateLoadingStatus('Setting up hand tracking...');
        await initHandTracking();
        
        updateLoadingStatus('Configuring controls...');
        initControls();
        
        // Hide loading screen
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
        
        // Start animation
        animate();
        
    } catch (error) {
        console.error('Initialization error:', error);
        updateLoadingStatus('Error: ' + error.message);
    }
}

function updateLoadingStatus(status) {
    loadingStatus.textContent = status;
}

// ============================================
// Three.js Setup
// ============================================
function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.0008);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    camera.position.set(0, 30, 150);
    
    // Renderer with high quality settings
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('particle-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    
    // Post-Processing Setup (Bloom Effect)
    const renderPass = new RenderPass(scene, camera);
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomIntensity,
        CONFIG.bloomRadius,
        CONFIG.bloomThreshold
    );
    composer.addPass(bloomPass);
    
    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = CONFIG.autoRotate;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    
    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ffff, 1.2, 500);
    pointLight1.position.set(150, 150, 150);
    pointLight1.castShadow = true;
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 400);
    pointLight2.position.set(-150, -150, -150);
    pointLight2.castShadow = true;
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xffff00, 0.8, 300);
    pointLight3.position.set(100, -100, 0);
    scene.add(pointLight3);
    
    // Create Enhanced Background (Nebulae & Stars)
    createNebulaeBackground();
    createBackgroundStars();
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize);
}

function createBackgroundStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 3000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);
    
    for (let i = 0; i < starsCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 3000;
        positions[i + 1] = (Math.random() - 0.5) * 3000;
        positions[i + 2] = (Math.random() - 0.5) * 3000;
        
        // Star colors (white, blue, yellow variations)
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
            colors[i] = 1;
            colors[i + 1] = 1;
            colors[i + 2] = 1;
        } else if (colorChoice < 0.75) {
            colors[i] = 0.7;
            colors[i + 1] = 0.8;
            colors[i + 2] = 1;
        } else {
            colors[i] = 1;
            colors[i + 1] = 0.9;
            colors[i + 2] = 0.6;
        }
        
        sizes[i / 3] = Math.random() * 2;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function createNebulaeBackground() {
    // Create realistic nebulae using particle clouds
    const nebulaeGeometry = new THREE.BufferGeometry();
    const nebulaeCount = 2000;
    const positions = new Float32Array(nebulaeCount * 3);
    const colors = new Float32Array(nebulaeCount * 3);
    
    // Create multiple nebula clouds in different positions
    const nebulaClusters = [
        { pos: { x: 400, y: 300, z: -400 }, color: { r: 0.3, g: 0.1, b: 0.8 } },
        { pos: { x: -350, y: -200, z: 350 }, color: { r: 0.8, g: 0.2, b: 0.4 } },
        { pos: { x: 300, y: -400, z: 200 }, color: { r: 0.1, g: 0.6, b: 0.9 } }
    ];
    
    let index = 0;
    nebulaClusters.forEach(cluster => {
        for (let i = 0; i < nebulaeCount / 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 200;
            const depth = (Math.random() - 0.5) * 150;
            
            positions[index * 3] = cluster.pos.x + Math.cos(angle) * radius;
            positions[index * 3 + 1] = cluster.pos.y + Math.sin(angle) * radius;
            positions[index * 3 + 2] = cluster.pos.z + depth;
            
            colors[index * 3] = cluster.color.r + (Math.random() - 0.5) * 0.3;
            colors[index * 3 + 1] = cluster.color.g + (Math.random() - 0.5) * 0.3;
            colors[index * 3 + 2] = cluster.color.b + (Math.random() - 0.5) * 0.3;
            
            index++;
        }
    });
    
    nebulaeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nebulaeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const nebulaeMaterial = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 0.15,
        sizeAttenuation: true,
        map: createParticleTexture()
    });
    
    const nebulae = new THREE.Points(nebulaeGeometry, nebulaeMaterial);
    nebulaeParticles.push(nebulae);
    scene.add(nebulae);
}

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// Particle System
// ============================================
async function createParticleSystem() {
    particleGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);
    const sizes = new Float32Array(CONFIG.particleCount);
    
    // Initialize arrays
    originalPositions = [];
    targetPositions = [];
    velocities = [];
    
    // Generate initial positions based on template
    generateTemplatePositions(CONFIG.currentTemplate);
    
    // Set initial positions
    for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = targetPositions[i3];
        positions[i3 + 1] = targetPositions[i3 + 1];
        positions[i3 + 2] = targetPositions[i3 + 2];
        
        // Random velocities
        velocities.push(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        sizes[i] = CONFIG.particleSize * (0.5 + Math.random());
    }
    
    // Apply colors
    applyColorPalette(colors);
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    particleMaterial = new THREE.PointsMaterial({
        size: CONFIG.particleSize,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        emissive: 0x444444
    });
    
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Update particle count display
    particleCountEl.textContent = CONFIG.particleCount.toLocaleString();
}

function generateTemplatePositions(template) {
    targetPositions = [];
    originalPositions = [];
    
    const count = CONFIG.particleCount;
    
    switch (template) {
        case 'solarsystem':
            generateSolarSystem(count);
            break;
        case 'sphere':
            generateSphere(count);
            break;
        case 'heart':
            generateHeart(count);
            break;
        case 'flower':
            generateFlower(count);
            break;
        case 'saturn':
            generateSaturn(count);
            break;
        case 'firework':
            generateFirework(count);
            break;
        case 'galaxy':
            generateGalaxy(count);
            break;
        case 'dna':
            generateDNA(count);
            break;
        case 'star':
            generateStar(count);
            break;
        case 'cube':
            generateCube(count);
            break;
        case 'cone':
            generateCone(count);
            break;
        case 'torus':
            generateTorus(count);
            break;
        case 'icosahedron':
            generateIcosahedron(count);
            break;
        case 'spiral':
            generateSpiral(count);
            break;
        case 'wave':
            generateWave(count);
            break;
        case 'helix':
            generateHelix(count);
            break;
        case 'crystal':
            generateCrystal(count);
            break;
        case 'lattice':
            generateLattice(count);
            break;
        case 'vortex':
            generateVortex(count);
            break;
        case 'ring':
            generateRing(count);
            break;
        default:
            generateSphere(count);
    }
    
    originalPositions = [...targetPositions];
}

function generateSolarSystem(count) {
    // Solar system with 8 planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune)
    const planets = [
        { name: 'Mercury', distance: 20, size: 2, color: 0x8c7853, particles: Math.floor(count * 0.06) },
        { name: 'Venus', distance: 35, size: 4, color: 0xffc649, particles: Math.floor(count * 0.08) },
        { name: 'Earth', distance: 55, size: 4.2, color: 0x4169e1, particles: Math.floor(count * 0.1) },
        { name: 'Mars', distance: 75, size: 3.8, color: 0xff6347, particles: Math.floor(count * 0.09) },
        { name: 'Jupiter', distance: 110, size: 11, color: 0xdaa520, particles: Math.floor(count * 0.25) },
        { name: 'Saturn', distance: 145, size: 9, color: 0xf4a460, particles: Math.floor(count * 0.22) },
        { name: 'Uranus', distance: 175, size: 6, color: 0x4fd0e7, particles: Math.floor(count * 0.1) },
        { name: 'Neptune', distance: 205, size: 5.8, color: 0x4169e1, particles: Math.floor(count * 0.1) }
    ];
    
    // Add sun (center)
    const sunParticles = Math.floor(count * 0.04);
    for (let i = 0; i < sunParticles; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * 8;
        
        targetPositions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
    }
    
    // Add planets
    planets.forEach(planet => {
        for (let i = 0; i < planet.particles; i++) {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            const radius = planet.size * 0.5 + Math.random() * planet.size * 0.5;
            
            // Orbital position
            const orbitAngle = Math.random() * Math.PI * 2;
            const centerX = Math.cos(orbitAngle) * planet.distance;
            const centerZ = Math.sin(orbitAngle) * planet.distance;
            
            targetPositions.push(
                centerX + radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                centerZ + radius * Math.cos(phi)
            );
        }
    });
    
    // Fill remaining particles with orbital debris
    const remaining = count - targetPositions.length / 3;
    for (let i = 0; i < remaining; i++) {
        const orbitDistance = 50 + Math.random() * 200;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 20;
        
        targetPositions.push(
            Math.cos(angle) * orbitDistance,
            height,
            Math.sin(angle) * orbitDistance
        );
    }
}

function generateSphere(count) {
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * 20;
        
        targetPositions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
    }
}

function generateHeart(count) {
    for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI * 2;
        const scale = 3 + Math.random() * 1;
        const depth = (Math.random() - 0.5) * 15;
        
        // Heart parametric equation
        const x = 16 * Math.pow(Math.sin(t), 3) * scale;
        const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
        
        targetPositions.push(x, y, depth);
    }
}

function generateFlower(count) {
    for (let i = 0; i < count; i++) {
        const petals = 6;
        const theta = Math.random() * Math.PI * 2;
        const r = 35 * Math.cos(petals * theta) + Math.random() * 15;
        const z = (Math.random() - 0.5) * 20;
        
        targetPositions.push(
            r * Math.cos(theta),
            r * Math.sin(theta),
            z
        );
    }
}

function generateSaturn(count) {
    // 60% for the planet, 40% for the ring
    const planetCount = Math.floor(count * 0.6);
    const ringCount = count - planetCount;
    
    // Planet (sphere)
    for (let i = 0; i < planetCount; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 5;
        
        targetPositions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
    }
    
    // Ring
    for (let i = 0; i < ringCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * 25;
        const tilt = 0.3;
        
        targetPositions.push(
            radius * Math.cos(angle),
            radius * Math.sin(angle) * tilt + (Math.random() - 0.5) * 3,
            radius * Math.sin(angle) * Math.sqrt(1 - tilt * tilt)
        );
    }
}

function generateFirework(count) {
    const bursts = 5;
    const particlesPerBurst = Math.floor(count / bursts);
    
    for (let b = 0; b < bursts; b++) {
        const centerX = (Math.random() - 0.5) * 80;
        const centerY = (Math.random() - 0.5) * 80;
        const centerZ = (Math.random() - 0.5) * 80;
        
        for (let i = 0; i < particlesPerBurst; i++) {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 30;
            
            targetPositions.push(
                centerX + radius * Math.sin(phi) * Math.cos(theta),
                centerY + radius * Math.sin(phi) * Math.sin(theta),
                centerZ + radius * Math.cos(phi)
            );
        }
    }
    
    // Fill remaining particles
    const remaining = count - bursts * particlesPerBurst;
    for (let i = 0; i < remaining; i++) {
        targetPositions.push(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );
    }
}

function generateGalaxy(count) {
    const arms = 4;
    const armWidth = 0.5;
    
    for (let i = 0; i < count; i++) {
        const arm = Math.floor(Math.random() * arms);
        const armAngle = (arm / arms) * Math.PI * 2;
        const distance = Math.random() * 60;
        const spiral = distance * 0.1;
        const angle = armAngle + spiral + (Math.random() - 0.5) * armWidth;
        
        const x = Math.cos(angle) * distance;
        const y = (Math.random() - 0.5) * (10 - distance * 0.1);
        const z = Math.sin(angle) * distance;
        
        targetPositions.push(x, y, z);
    }
}

function generateDNA(count) {
    const turns = 4;
    const height = 120;
    const radius = 20;
    
    for (let i = 0; i < count; i++) {
        const t = (i / count) * turns * Math.PI * 2;
        const y = (i / count) * height - height / 2;
        const strand = i % 2;
        
        const angle = t + (strand * Math.PI);
        const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 5;
        const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 5;
        
        // Add some connectors
        if (Math.random() > 0.9) {
            targetPositions.push(
                x * (0.3 + Math.random() * 0.7),
                y + (Math.random() - 0.5) * 2,
                z * (0.3 + Math.random() * 0.7)
            );
        } else {
            targetPositions.push(x, y, z);
        }
    }
}

function generateStar(count) {
    const points = 5;
    const outerRadius = 50;
    const innerRadius = 20;
    
    for (let i = 0; i < count; i++) {
        const angle = (Math.random() * points * 2) * Math.PI / points;
        const isOuter = Math.floor(angle / (Math.PI / points)) % 2 === 0;
        const baseRadius = isOuter ? outerRadius : innerRadius;
        const radius = baseRadius * (0.5 + Math.random() * 0.5);
        
        const depth = (Math.random() - 0.5) * 20;
        
        targetPositions.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            depth
        );
    }
}

// NEW TEMPLATES
function generateCube(count) {
    const size = 40;
    for (let i = 0; i < count; i++) {
        const face = Math.floor(Math.random() * 6);
        let x, y, z;
        
        switch(face) {
            case 0: // Front
                x = (Math.random() - 0.5) * size * 2;
                y = (Math.random() - 0.5) * size * 2;
                z = size;
                break;
            case 1: // Back
                x = (Math.random() - 0.5) * size * 2;
                y = (Math.random() - 0.5) * size * 2;
                z = -size;
                break;
            case 2: // Left
                x = -size;
                y = (Math.random() - 0.5) * size * 2;
                z = (Math.random() - 0.5) * size * 2;
                break;
            case 3: // Right
                x = size;
                y = (Math.random() - 0.5) * size * 2;
                z = (Math.random() - 0.5) * size * 2;
                break;
            case 4: // Top
                x = (Math.random() - 0.5) * size * 2;
                y = size;
                z = (Math.random() - 0.5) * size * 2;
                break;
            case 5: // Bottom
                x = (Math.random() - 0.5) * size * 2;
                y = -size;
                z = (Math.random() - 0.5) * size * 2;
                break;
        }
        targetPositions.push(x, y, z);
    }
}

function generateCone(count) {
    const height = 80;
    const baseRadius = 30;
    
    for (let i = 0; i < count; i++) {
        const progress = Math.random();
        const currentRadius = baseRadius * (1 - progress);
        const theta = Math.random() * Math.PI * 2;
        const y = progress * height - height / 2;
        
        targetPositions.push(
            Math.cos(theta) * currentRadius,
            y,
            Math.sin(theta) * currentRadius
        );
    }
}

function generateTorus(count) {
    const majorRadius = 40;
    const minorRadius = 15;
    
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        
        const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
        const y = minorRadius * Math.sin(phi);
        const z = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
        
        targetPositions.push(x, y, z);
    }
}

function generateIcosahedron(count) {
    // Approximate icosahedron using golden ratio
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [
        [-1,  phi, -0], [ 1,  phi, -0], [-1, -phi, -0], [ 1, -phi, -0],
        [-0, -1,  phi], [-0,  1,  phi], [-0, -1, -phi], [-0,  1, -phi],
        [ phi, -0, -1], [ phi, -0,  1], [-phi, -0, -1], [-phi, -0,  1]
    ];
    
    for (let i = 0; i < count; i++) {
        const vertex = vertices[i % vertices.length];
        const scale = 25;
        targetPositions.push(
            vertex[0] * scale + (Math.random() - 0.5) * 10,
            vertex[1] * scale + (Math.random() - 0.5) * 10,
            vertex[2] * scale + (Math.random() - 0.5) * 10
        );
    }
}

function generateSpiral(count) {
    const turns = 6;
    const height = 100;
    const radius = 40;
    
    for (let i = 0; i < count; i++) {
        const progress = i / count;
        const angle = progress * turns * Math.PI * 2;
        const y = progress * height - height / 2;
        const currentRadius = radius * (1 - progress * 0.5);
        
        targetPositions.push(
            Math.cos(angle) * currentRadius,
            y,
            Math.sin(angle) * currentRadius
        );
    }
}

function generateWave(count) {
    const wavelength = 40;
    const amplitude = 30;
    const length = 100;
    
    for (let i = 0; i < count; i++) {
        const x = (i / count - 0.5) * length;
        const y = Math.sin((i / count) * Math.PI * 4) * amplitude;
        const z = (Math.random() - 0.5) * wavelength;
        
        targetPositions.push(x, y, z);
    }
}

function generateHelix(count) {
    const turns = 5;
    const radius = 30;
    const height = 80;
    
    for (let i = 0; i < count; i++) {
        const progress = i / count;
        const angle = progress * turns * Math.PI * 2;
        const y = progress * height - height / 2;
        
        targetPositions.push(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
        );
    }
}

function generateCrystal(count) {
    const shards = 8;
    const shardCount = Math.floor(count / shards);
    
    for (let s = 0; s < shards; s++) {
        const angle = (s / shards) * Math.PI * 2;
        const baseX = Math.cos(angle) * 30;
        const baseZ = Math.sin(angle) * 30;
        
        for (let i = 0; i < shardCount; i++) {
            const progress = i / shardCount;
            const distance = progress * 50;
            
            targetPositions.push(
                baseX * (1 + progress * 2),
                (progress - 0.5) * 60,
                baseZ * (1 + progress * 2)
            );
        }
    }
}

function generateLattice(count) {
    const gridSize = Math.ceil(Math.cbrt(count));
    const spacing = 80 / gridSize;
    const offset = spacing * gridSize / 2;
    
    let index = 0;
    for (let x = 0; x < gridSize && index < count; x++) {
        for (let y = 0; y < gridSize && index < count; y++) {
            for (let z = 0; z < gridSize && index < count; z++) {
                targetPositions.push(
                    x * spacing - offset,
                    y * spacing - offset,
                    z * spacing - offset
                );
                index++;
            }
        }
    }
}

function generateVortex(count) {
    const maxRadius = 50;
    const height = 100;
    const turns = 8;
    
    for (let i = 0; i < count; i++) {
        const progress = i / count;
        const angle = progress * turns * Math.PI * 2;
        const radius = maxRadius * progress;
        const y = progress * height - height / 2;
        
        targetPositions.push(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
        );
    }
}

function generateRing(count) {
    const innerRadius = 25;
    const outerRadius = 45;
    const thickness = 15;
    
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        
        targetPositions.push(
            Math.cos(theta) * radius,
            Math.cos(phi) * thickness - Math.sin(phi) * thickness,
            Math.sin(theta) * radius
        );
    }
}

function applyColorPalette(colors) {
    const palette = COLOR_PALETTES[CONFIG.currentColor];
    
    for (let i = 0; i < CONFIG.particleCount; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
}

function updateParticleColors() {
    const colors = particleGeometry.attributes.color.array;
    applyColorPalette(colors);
    particleGeometry.attributes.color.needsUpdate = true;
}

function switchTemplate(template) {
    CONFIG.currentTemplate = template;
    generateTemplatePositions(template);
    
    // Update active button
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.template === template);
    });
}

function updateParticleCount(count) {
    CONFIG.particleCount = count;
    
    // Remove old particles
    scene.remove(particles);
    particleGeometry.dispose();
    particleMaterial.dispose();
    
    // Create new particles
    createParticleSystem();
}

// ============================================
// Hand Tracking
// ============================================
async function initHandTracking() {
    try {
        // Get camera stream with higher resolution
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: 'user' }
        });
        cameraFeed.srcObject = stream;
        await cameraFeed.play();
        
        // Set canvas size
        handCanvas.width = 200;
        handCanvas.height = 150;
        
        // Initialize MediaPipe Hands with improved settings
        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5,
            staticImageMode: false
        });
        
        hands.onResults(onHandResults);
        handTracker = hands;
        
        // Start camera processing
        const cameraUtils = new Camera(cameraFeed, {
            onFrame: async () => {
                if (CONFIG.trackingEnabled && handTracker) {
                    await handTracker.send({ image: cameraFeed });
                }
            },
            width: 1280,
            height: 720
        });
        cameraUtils.start();
        
    } catch (error) {
        console.warn('Hand tracking not available:', error);
        updateGestureDisplay('❌', 'Camera not available');
    }
}

function onHandResults(results) {
    // Clear canvas
    handCtx.clearRect(0, 0, handCanvas.width, handCanvas.height);
    
    // Draw camera feed
    handCtx.save();
    handCtx.drawImage(results.image, 0, 0, handCanvas.width, handCanvas.height);
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Draw hand connections
        drawConnectors(handCtx, landmarks, HAND_CONNECTIONS, {
            color: '#00ffff',
            lineWidth: 2
        });
        
        // Draw landmarks
        drawLandmarks(handCtx, landmarks, {
            color: '#ff00ff',
            lineWidth: 1,
            radius: 3
        });
        
        // Detect gesture
        const gesture = detectGesture(landmarks);
        handleGesture(gesture, landmarks);
    } else {
        updateGestureDisplay('✋', 'No Hand Detected');
        CONFIG.targetExpansion = 1;
    }
    
    handCtx.restore();
}

function detectGesture(landmarks) {
    // Get finger states (extended or not)
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const indexMCP = landmarks[5];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const middleMCP = landmarks[9];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const ringMCP = landmarks[13];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const pinkyMCP = landmarks[17];
    const wrist = landmarks[0];
    const palmCenter = landmarks[9];
    
    // Enhanced finger detection with multiple checks
    const thumbExtended = thumbTip.y < thumbMCP.y && thumbTip.x > thumbMCP.x;
    const indexExtended = indexTip.y < indexPIP.y + 0.05;
    const middleExtended = middleTip.y < middlePIP.y + 0.05;
    const ringExtended = ringTip.y < ringPIP.y + 0.05;
    const pinkyExtended = pinkyTip.y < pinkyPIP.y + 0.05;
    
    // Calculate hand openness
    const fingerCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(f => f).length;
    
    // Fist - all fingers closed
    if (fingerCount === 0) {
        return 'fist';
    }
    
    // Open palm - all fingers extended
    if (fingerCount === 4 && thumbExtended) {
        return 'palm';
    }
    
    // Point - only index extended
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
        return 'point';
    }
    
    // Peace sign - index and middle extended, thumb and pinky closed
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
        return 'peace';
    }
    
    // Victory - index and middle extended with thumb also visible
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && thumbExtended) {
        return 'victory';
    }
    
    // Rock sign - index and pinky extended
    if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
        return 'rock';
    }
    
    // Thumbs up - only thumb extended and pointing up
    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        if (thumbTip.y < wrist.y - 0.1) {
            return 'thumbsup';
        } else if (thumbTip.y > wrist.y + 0.1) {
            // Thumbs down - thumb pointing down
            return 'thumbsdown';
        }
    }
    
    // OK sign - thumb and index forming circle
    const thumbIndexDist = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) + 
        Math.pow(thumbTip.y - indexTip.y, 2)
    );
    if (thumbIndexDist < 0.05 && middleExtended && ringExtended && pinkyExtended) {
        return 'ok';
    }
    
    // Grabbing - all fingers together (pinched)
    const allTipDist = 
        Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)) +
        Math.sqrt(Math.pow(indexTip.x - middleTip.x, 2) + Math.pow(indexTip.y - middleTip.y, 2)) +
        Math.sqrt(Math.pow(middleTip.x - ringTip.x, 2) + Math.pow(middleTip.y - ringTip.y, 2)) +
        Math.sqrt(Math.pow(ringTip.x - pinkyTip.x, 2) + Math.pow(ringTip.y - pinkyTip.y, 2));
    if (allTipDist < 0.2 && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return 'grabbing';
    }
    
    // Wave hand - moving palm with fingers extended
    if (fingerCount === 4) {
        return 'wavehand';
    }
    
    // Pinch - thumb and index very close but middle extended
    if (thumbIndexDist < 0.04 && middleExtended) {
        return 'pinch';
    }
    
    return 'unknown';
}

function handleGesture(gesture, landmarks) {
    const now = Date.now();
    
    // Calculate hand openness for expansion using better metrics
    const wrist = landmarks[0];
    const middleMCP = landmarks[9];
    const middleTip = landmarks[12];
    const indexTip = landmarks[8];
    const pinkyTip = landmarks[20];
    
    // Distance from wrist to middle finger tip
    const handSpan = Math.sqrt(
        Math.pow(middleTip.x - wrist.x, 2) +
        Math.pow(middleTip.y - wrist.y, 2)
    );
    
    // Calculate spread (distance between index and pinky)
    const fingerSpread = Math.sqrt(
        Math.pow(indexTip.x - pinkyTip.x, 2) +
        Math.pow(indexTip.y - pinkyTip.y, 2)
    );
    
    // Map hand metrics to expansion factor
    const baseExpansion = handSpan * 3;
    const spreadFactor = fingerSpread * 2;
    CONFIG.targetExpansion = 0.5 + baseExpansion + spreadFactor;
    CONFIG.targetExpansion = Math.min(Math.max(CONFIG.targetExpansion, 0.3), 3);
    
    // Handle specific gestures with cooldown
    if (now - lastGestureTime > CONFIG.gestureTimeout && gesture !== currentGesture) {
        currentGesture = gesture;
        lastGestureTime = now;
        
        const config = GESTURE_CONFIG[gesture];
        if (config) {
            updateGestureDisplay(config.icon, config.name);
        }
        
        switch (gesture) {
            case 'palm':
                // Expand already handled in handleGesture for continuous control
                break;
                
            case 'fist':
                // Contract already handled in handleGesture for continuous control
                break;
                
            case 'point':
                cycleTemplate();
                break;
                
            case 'peace':
                cycleColor();
                break;
                
            case 'rock':
                triggerFireworkBurst();
                break;
                
            case 'thumbsup':
                increaseSpeed();
                break;
            
            case 'thumbsdown':
                decreaseSpeed();
                break;
            
            case 'ok':
                resetView();
                break;
            
            case 'victory':
                // Victory sign can toggle something
                break;
                
            case 'grabbing':
                // Grabbing can pause animation
                CONFIG.animationSpeed = CONFIG.animationSpeed === 0 ? 1 : 0;
                document.getElementById('speed-slider').value = CONFIG.animationSpeed;
                document.getElementById('speed-value').textContent = CONFIG.animationSpeed.toFixed(1);
                break;
                
            case 'wavehand':
                cycleRandomTemplate();
                break;
                
            case 'pinch':
                toggleTracking();
                break;
                
            default:
                break;
        }
    }
}

function decreaseSpeed() {
    CONFIG.animationSpeed = Math.max(CONFIG.animationSpeed - 0.3, 0.1);
    document.getElementById('speed-slider').value = CONFIG.animationSpeed;
    document.getElementById('speed-value').textContent = CONFIG.animationSpeed.toFixed(1);
}

function resetView() {
    controls.reset();
    CONFIG.animationSpeed = 1;
    CONFIG.expansionFactor = 1;
    document.getElementById('speed-slider').value = 1;
    document.getElementById('speed-value').textContent = '1.0';
}

function cycleRandomTemplate() {
    const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
    switchTemplate(TEMPLATES[randomIndex]);
}

function previousTemplate() {
    const currentIndex = TEMPLATES.indexOf(CONFIG.currentTemplate);
    const prevIndex = (currentIndex - 1 + TEMPLATES.length) % TEMPLATES.length;
    switchTemplate(TEMPLATES[prevIndex]);
}

function toggleTracking() {
    CONFIG.trackingEnabled = !CONFIG.trackingEnabled;
    document.getElementById('tracking-toggle').checked = CONFIG.trackingEnabled;
}

function updateGestureDisplay(icon, name) {
    gestureIconEl.textContent = icon;
    gestureNameEl.textContent = name;
}

function cycleTemplate() {
    const currentIndex = TEMPLATES.indexOf(CONFIG.currentTemplate);
    const nextIndex = (currentIndex + 1) % TEMPLATES.length;
    switchTemplate(TEMPLATES[nextIndex]);
}

function cycleColor() {
    const colors = Object.keys(COLOR_PALETTES);
    const currentIndex = colors.indexOf(CONFIG.currentColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    CONFIG.currentColor = colors[nextIndex];
    
    // Update active button
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === CONFIG.currentColor);
    });
    
    updateParticleColors();
}

function triggerFireworkBurst() {
    isFireworkBurst = true;
    fireworkProgress = 0;
}

function increaseSpeed() {
    CONFIG.animationSpeed = Math.min(CONFIG.animationSpeed + 0.3, 3);
    document.getElementById('speed-slider').value = CONFIG.animationSpeed;
    document.getElementById('speed-value').textContent = CONFIG.animationSpeed.toFixed(1);
}

// ============================================
// UI Controls
// ============================================
function initControls() {
    // Panel toggle
    const toggleBtn = document.getElementById('toggle-panel');
    const panelContent = document.querySelector('.panel-content');
    
    toggleBtn.addEventListener('click', () => {
        panelContent.classList.toggle('collapsed');
        toggleBtn.textContent = panelContent.classList.contains('collapsed') ? '+' : '−';
    });
    
    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTemplate(btn.dataset.template);
        });
    });
    
    // Color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            CONFIG.currentColor = btn.dataset.color;
            updateParticleColors();
        });
    });
    
    // Particle count slider
    const particleSlider = document.getElementById('particle-slider');
    const countValue = document.getElementById('count-value');
    let sliderTimeout;
    
    particleSlider.addEventListener('input', (e) => {
        countValue.textContent = e.target.value;
        clearTimeout(sliderTimeout);
        sliderTimeout = setTimeout(() => {
            updateParticleCount(parseInt(e.target.value));
        }, 300);
    });
    
    // Size slider
    const sizeSlider = document.getElementById('size-slider');
    const sizeValue = document.getElementById('size-value');
    
    sizeSlider.addEventListener('input', (e) => {
        CONFIG.particleSize = parseFloat(e.target.value);
        sizeValue.textContent = CONFIG.particleSize;
        particleMaterial.size = CONFIG.particleSize;
        
        // Update sizes
        const sizes = particleGeometry.attributes.size.array;
        for (let i = 0; i < CONFIG.particleCount; i++) {
            sizes[i] = CONFIG.particleSize * (0.5 + Math.random());
        }
        particleGeometry.attributes.size.needsUpdate = true;
    });
    
    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    
    speedSlider.addEventListener('input', (e) => {
        CONFIG.animationSpeed = parseFloat(e.target.value);
        speedValue.textContent = CONFIG.animationSpeed.toFixed(1);
    });
    
    // Tracking toggle
    const trackingToggle = document.getElementById('tracking-toggle');
    trackingToggle.addEventListener('change', (e) => {
        CONFIG.trackingEnabled = e.target.checked;
        if (!e.target.checked) {
            updateGestureDisplay('⏸️', 'Tracking Paused');
        }
    });
    
    // Auto rotate toggle
    const rotateToggle = document.getElementById('rotate-toggle');
    rotateToggle.addEventListener('change', (e) => {
        CONFIG.autoRotate = e.target.checked;
        controls.autoRotate = e.target.checked;
    });
    
    // Gesture guide
    const guideBtn = document.getElementById('show-guide');
    const gestureGuide = document.getElementById('gesture-guide');
    const closeGuide = document.getElementById('close-guide');
    
    guideBtn.addEventListener('click', () => {
        gestureGuide.classList.toggle('visible');
    });
    
    closeGuide.addEventListener('click', () => {
        gestureGuide.classList.remove('visible');
    });
}

// ============================================
// Animation Loop
// ============================================
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime() * CONFIG.animationSpeed;
    
    // Update FPS counter
    frameCount++;
    if (time - lastFPSUpdate > 0.5) {
        const fps = Math.round(frameCount / (time - lastFPSUpdate));
        fpsCounterEl.textContent = fps;
        frameCount = 0;
        lastFPSUpdate = time;
    }
    
    // Animate nebulae
    nebulaeParticles.forEach(nebula => {
        nebula.rotation.x += delta * 0.01;
        nebula.rotation.y += delta * 0.02;
    });
    
    // Update particles
    updateParticles(time, delta);
    
    // Update controls
    controls.update();
    
    // Render with post-processing
    composer.render();
}

function updateParticles(time, delta) {
    if (!particles) return;
    
    const positions = particleGeometry.attributes.position.array;
    
    // Smooth expansion transition
    CONFIG.expansionFactor += (CONFIG.targetExpansion - CONFIG.expansionFactor) * 0.05;
    
    // Handle firework burst
    if (isFireworkBurst) {
        fireworkProgress += delta * 2;
        
        if (fireworkProgress < 1) {
            // Explode outward
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const i3 = i * 3;
                const vx = velocities[i3];
                const vy = velocities[i3 + 1];
                const vz = velocities[i3 + 2];
                
                positions[i3] += vx * 100 * delta;
                positions[i3 + 1] += vy * 100 * delta;
                positions[i3 + 2] += vz * 100 * delta;
            }
        } else if (fireworkProgress < 3) {
            // Return to formation
            for (let i = 0; i < CONFIG.particleCount; i++) {
                const i3 = i * 3;
                const targetX = originalPositions[i3] * CONFIG.expansionFactor;
                const targetY = originalPositions[i3 + 1] * CONFIG.expansionFactor;
                const targetZ = originalPositions[i3 + 2] * CONFIG.expansionFactor;
                
                positions[i3] += (targetX - positions[i3]) * 0.05;
                positions[i3 + 1] += (targetY - positions[i3 + 1]) * 0.05;
                positions[i3 + 2] += (targetZ - positions[i3 + 2]) * 0.05;
            }
        } else {
            isFireworkBurst = false;
        }
    } else {
        // Normal animation - morph to target with expansion
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            
            // Target position with expansion
            const targetX = originalPositions[i3] * CONFIG.expansionFactor;
            const targetY = originalPositions[i3 + 1] * CONFIG.expansionFactor;
            const targetZ = originalPositions[i3 + 2] * CONFIG.expansionFactor;
            
            // Add subtle animation
            const noise = Math.sin(time + i * 0.01) * 2;
            
            // Smooth transition to target
            positions[i3] += (targetX + noise - positions[i3]) * 0.03;
            positions[i3 + 1] += (targetY + noise * 0.5 - positions[i3 + 1]) * 0.03;
            positions[i3 + 2] += (targetZ + noise * 0.3 - positions[i3 + 2]) * 0.03;
        }
    }
    
    particleGeometry.attributes.position.needsUpdate = true;
    
    // Rotate particle system
    particles.rotation.y = time * 0.1;
}

// ============================================
// Start Application
// ============================================
init();
