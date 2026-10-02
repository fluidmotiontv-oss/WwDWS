# FluidmotionTV · West Coast Radio & 3D Sovereign Storefront

[![Three.js](https://img.shields.io/badge/Three.js-r182-black?style=flat&logo=three.js)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-FFT%20Analyzer-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

> An immersive 3D audio-reactive portal featuring the deep-field **Horizon Engine**, articulated **Cyber Dragons**, interactive **Ionized Plasma FX**, 10 auto-morphing **Dimension Rooms**, and *The Fluid Motion of the Future* **Sovereign Storefront**.

---

## 🌟 Key Features

### 1. 10 Audio-Reactive 3D Dimension Rooms
Explore 10 distinct procedural visual realms with custom GLSL shaders, dynamic lighting, and specialized dragon skins:
- **01. Pacific Horizon** — Iconic West Coast sunset ocean swell, solar disc, and cyan horizon.
- **02. Neon Shibuya Grid** — High-density cyberpunk vertical skyscrapers and reflective gridlines.
- **03. Quantum Nebula** — Deep space void, volumetric dust, and gravitational particle spirals.
- **04. Malibu Synth Palms** — Outrun 1986 vector grid canyon, horizontal striped sun, and neon palms.
- **05. Emerald Aurora** — Bioluminescent mint & emerald curtains responding to mid-range harmonics.
- **06. Solar Helios** — Molten obsidian ridges, magma amber turbulence, and explosive solar flares.
- **07. Crystal Matrix** — Floating refractive diamond prisms with chromatic dispersion rings.
- **08. Abyssal Mariana** — Oceanic hydrothermal trench reacting to deep 808 sub-bass drops.
- **09. Chrono Warp Tunnel** — Relativistic hyperspace tunnel with concentric Doppler rings.
- **10. Sovereign Sanctuary** — Sacred golden obsidian monoliths from *The Fluid Motion of the Future* codex.

### 2. Audio Engine & Multiple Sources
- **Built-in Generative West Coast Synth**: Analog pads, Rhodes chords in F# minor, warm sub-bass, and lo-fi percussion playing natively without external downloads.
- **MP3 Library (`public/mp3s/`)**: Drop your `.mp3` files into `public/mp3s/` to stream them with real-time FFT analysis.
- **Local Audio Uploads**: Drag and drop any MP3 from your device directly onto the browser canvas.
- **Live Studio Microphone**: Direct input from your microphone for live DJ sets.

### 3. Cyber Dragons & Flocking Dynamics
- Articulated serpentine cyber dragons navigating the 3D space with Boids flocking physics.
- Flap frequency, spine undulation, speed boosts, and emissive flares sync directly to audio transients.

### 4. Interactive Ionized Plasma FX
- Move your mouse or touch the screen to ignite energetic ripples, vortex swirls, and ionized gas discharges.

### 5. Sovereign Storefront & PayPal Gateway
- 3D holographic tilt inspection card showcasing *The Fluid Motion of the Future: Introductory Master Edition ($9.00)*.
- Real-time PayPal Business API checkout flow simulation with cryptographic token minting.
- Live sales telemetry dashboard tracking US-WEST sovereign server node pings and acquisition streams.

---

## 📁 MP3 Audio Folder Structure

To add your own audio tracks:
1. Place `.mp3` files in `/public/mp3s/`.
2. Edit `/public/mp3s/manifest.json` with track metadata:
```json
{
  "id": "track-id",
  "filename": "my_song.mp3",
  "title": "My Track Title",
  "artist": "Artist Name",
  "bpm": 90,
  "genre": "West Coast Synthwave"
}
```

---

## 🚀 Quickstart & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🌐 Deploy to GitHub Pages

1. In your GitHub repository: go to **Settings → Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions** (or deploy the `dist/` folder).
3. If using GitHub Actions, create `.github/workflows/deploy.yml` with standard Vite static site deployment.

---

## 🎹 Keyboard Shortcuts

| Key | Action |
|---|---|
| `1` – `9` | Jump directly to Rooms 1 through 9 |
| `0` | Jump to Room 10 (Sovereign Sanctuary) |
| `R` | Jump to a Random Realm |
| `M` | Toggle Auto-Morphing mode |
| `Space` | Play / Pause audio |

---

© 2026 FluidmotionTV. All rights reserved.
