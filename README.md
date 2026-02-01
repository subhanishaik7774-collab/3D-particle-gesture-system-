# 🌌 Advanced Particle Gesture System - Universe Edition

A cutting-edge real-time interactive 3D particle visualization system with hand gesture control, realistic space effects, and a complete interactive solar system. Built with **Three.js**, **MediaPipe**, and advanced WebGL post-processing effects.

![Particle System Demo](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop)
*(Note: Replace this image with a screenshot of your actual running app)*

## 🎮 Features

### 📦 Complete Particle Templates (20 Total!)
- **☀️ Solar System**: Realistic 8-planet solar system with Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune
- **Sphere**: Classic particle sphere
- **❤️ Heart**: Heart-shaped formation
- **🌸 Flower**: Beautiful petal patterns
- **🪐 Saturn**: Planet with orbiting rings
- **🎆 Firework**: Explosive particle bursts
- **🌌 Galaxy**: Spiral galaxy with multiple arms
- **🧬 DNA**: Double helix structure
- **⭐ Star**: 5-pointed star pattern
- **🎲 Cube**: Geometric cube grid (NEW)
- **🔺 Cone**: Conical distribution (NEW)
- **⭕ Torus**: Toroidal geometry (NEW)
- **💎 Crystal**: Golden ratio icosahedron (NEW)
- **🌀 Spiral**: Multi-turn spiral helix (NEW)
- **〰️ Wave**: Sinusoidal 3D wave (NEW)
- **🧬 Helix**: Double helix DNA-like (NEW)
- **✨ Shards**: 8-point radial crystal (NEW)
- **⬜ Lattice**: 3D grid structure (NEW)
- **🌪️ Vortex**: Tornado vortex pattern (NEW)
- **💍 Ring**: Thick toroidal ring (NEW)

### ✨ Advanced Hand Gesture Control (12 Gestures!)
- **✋ Open Palm**: Expand particles outward smoothly
- **✊ Fist**: Contract particles inward
- **☝️ Point Up**: Cycle through particle templates
- **✌️ Peace Sign**: Change color themes
- **🤟 Rock Sign**: Trigger firework burst effect
- **👍 Thumbs Up**: Speed up animation
- **👎 Thumbs Down**: Previous template (NEW)
- **🤏 Pinch**: Toggle hand tracking (NEW)
- **🤞 Victory Sign**: Random template (NEW)
- **🤚 Grab Gesture**: Pause/unpause animation (NEW)
- **👋 Wave Hand**: Speed down (NEW)
- **👌 OK Sign**: Reset view and controls

### 🎨 Enhanced Visual Effects
- **Bloom & Glow**: Realistic UnrealBloomPass post-processing
- **Nebulae Background**: Colorful particle clouds (purple, pink, cyan)
- **Enhanced Star Field**: 3000+ stars with realistic colors
- **High-Fidelity Lighting**: Multiple point lights with cyan, magenta, and yellow colors
- **Additive Blending**: Realistic particle interactions
- **Smooth Animations**: Advanced easing and transitions

### 🌈 6 Color Themes
- **Rainbow**: Full spectrum colors
- **Fire**: Red to yellow gradient
- **Ice**: Cyan to blue gradient
- **Nature**: Green shades
- **Sunset**: Pink and orange gradient
- **Neon**: Vibrant neon colors

### 📊 Real-Time Statistics
- **Particle Count Display**: Monitor active particle count
- **FPS Counter**: Real-time frame rate
- **Gesture Detection**: Visual gesture indicator
- **Hand Tracking Preview**: Live camera feed with hand landmarks

### 🎛️ Control Panel
- **Particle Count Slider**: Adjust particles 1K-20K
- **Particle Size Slider**: Fine-tune particle size
- **Animation Speed**: Control animation speed (0.1x-3x)
- **Hand Tracking Toggle**: Enable/disable gesture control
- **Auto-Rotate Toggle**: Camera auto-rotation

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Webcam for hand gesture tracking
- Recommended: Desktop or laptop (mobile support available)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd particle-gesture-system
   ```

2. **Open in a web server** (required due to module imports)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using Live Server extension in VS Code
   # Just right-click on index.html and select "Open with Live Server"
   ```

3. **Open in your browser**
   - Navigate to `http://localhost:8000`
   - Allow camera access when prompted
   - Start gesturing!

## 💡 How to Use

### Hand Gestures
1. **Position your hand** in front of the camera
2. **Make a gesture** from the list above
3. **Watch the particles respond** in real-time
4. **Experiment** with different combinations

### Control Panel
- Click the **Control Panel** toggle (⚙️) in the top-right
- Adjust sliders to customize particle behavior
- Select templates and colors with buttons
- View gesture guide with 🤚 button

### Tips for Better Hand Detection
- Ensure good lighting
- Keep your hand fully visible in the camera frame
- Make clear, deliberate gestures
- Adjust camera distance for best results

## 🛠️ Technical Stack

### Core Libraries
- **Three.js 0.160.0**: 3D graphics rendering
- **MediaPipe Hands**: Advanced hand tracking
- **WebGL 2.0**: GPU-accelerated rendering

### Advanced Features
- **Post-Processing**: UnrealBloomPass for bloom effects
- **Particle System**: 8000+ particles with real-time physics
- **Gesture Recognition**: Machine learning-based hand pose detection
- **Responsive Canvas**: Auto-scaling to window size
- **Font**: Orbitron (display) + Rajdhani (body)

## 📁 Project Structure

```
particle-gesture-system/
├── index.html           # Main HTML file with UI
├── main.js              # Core application logic
├── styles.css           # Styling and animations
└── README.md            # This file
```

## 🎯 Key Functions

### Hand Tracking
- `initHandTracking()`: Setup MediaPipe hand detection
- `detectGesture()`: Recognize hand gestures
- `handleGesture()`: Execute gesture commands

### Particle System
- `generateSolarSystem()`: Create 8-planet solar system
- `generateTemplatePositions()`: Generate particle formations
- `updateParticles()`: Update particle positions each frame

### Graphics
- `createNebulaeBackground()`: Render space background
- `createParticleTexture()`: Generate particle sprite texture
- `initThreeJS()`: Setup 3D scene and lighting

## 🐛 Troubleshooting

### Camera Not Working
- Check browser camera permissions
- Ensure HTTPS or localhost access
- Try a different browser

### Low FPS
- Reduce particle count (5000-8000)
- Decrease particle size
- Disable hand tracking
- Lower animation speed

### Gestures Not Detecting
- Improve lighting conditions
- Keep hand fully visible
- Make more pronounced gestures
- Adjust minimum confidence in code (line ~750)

## 📈 Performance

- **Particles**: Up to 20,000
- **Target FPS**: 60 (depends on hardware)
- **Memory**: ~100-200 MB
- **GPU Usage**: Moderate to high

## 🔧 Customization

### Change Default Template
Edit line 15 in `main.js`:
```javascript
currentTemplate: 'solarsystem'  // Change to: 'sphere', 'galaxy', etc.
```

### Adjust Particle Count
Edit line 11 in `main.js`:
```javascript
particleCount: 8000  // Change this value
```

### Modify Colors
Edit `COLOR_PALETTES` object in `main.js` (lines 26-63)

### Change Hand Detection Sensitivity
Edit hand configuration around line 750:
```javascript
minDetectionConfidence: 0.6,    // Lower = more sensitive
minTrackingConfidence: 0.5
```

## 📝 License

This project uses:
- Three.js (MIT License)
- MediaPipe (Apache 2.0)
- Feel free to use and modify for personal or commercial projects

## 🌟 Features Overview

| Feature | Status | Details |
|---------|--------|---------|
| Hand Gesture Control | ✅ | 7 gesture types supported |
| Particle System | ✅ | 8000+ particles, 9 templates |
| Solar System | ✅ NEW | Realistic 8-planet system |
| Bloom Effects | ✅ NEW | Realistic glow post-processing |
| Nebulae Background | ✅ NEW | Animated space environment |
| Real-time Stats | ✅ | FPS and particle counter |
| Mobile Responsive | ✅ | Works on mobile devices |
| Dark Mode | ✅ | Built-in dark theme |

## 🚀 Future Enhancements

- [ ] Orbital mechanics for solar system
- [ ] Sound effects and music
- [ ] VR/WebXR support
- [ ] Recording and export features
- [ ] Multi-hand gesture combinations
- [ ] Custom particle creation
- [ ] Advanced physics simulation
- [ ] Mobile app (Electron)

## 📞 Support

For issues or feature requests, please create an issue on the GitHub repository.

---

**Made with ❤️ using Three.js and MediaPipe**

## 🚀 How to Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/particle-universe.git
   cd particle-universe
   ```

2. **Run a local server**  
   Because this project uses ES modules and camera access, it requires a local server.
   
   **Using Python (Pre-installed on most systems):**
   ```bash
   # Windows/Linux/Mac
   python -m http.server 8000
   ```

   **Using Node.js:**
   ```bash
   npx serve .
   ```

3. Open your browser to `http://localhost:8000`.
4. **Allow camera access** when prompted to enable hand tracking.

## 🛠️ Technologies Used

- [Three.js](https://threejs.org/) - 3D Rendering Engine
- [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) - Machine Learning Hand Tracking
- Vanilla JavaScript & CSS3

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
