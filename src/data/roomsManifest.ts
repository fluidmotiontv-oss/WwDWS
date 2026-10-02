export interface RoomTheme {
  id: string;
  number: number;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  fogColor: number;
  fogDensity: number;
  ambientColor: number;
  keyLightColor: number;
  rimLightColor: number;
  fillLightColor: number;
  palette: {
    baseDark: [number, number, number];
    secondary: [number, number, number];
    vibrant1: [number, number, number];
    vibrant2: [number, number, number];
    accent: [number, number, number];
  };
  dragonColors: {
    alphaPrimary: number;
    alphaEmissive: number;
    betaPrimary: number;
    betaEmissive: number;
    gammaPrimary: number;
    gammaEmissive: number;
  };
  geometryType: 'horizon_grid' | 'cyber_monoliths' | 'cosmic_nebula' | 'retro_synth' | 'aurora_curtains' | 'solar_magma' | 'crystal_prism' | 'abyssal_deep' | 'chrono_warp' | 'sovereign_gold';
  plasmaStyle: 'liquid_fire' | 'ionized_cyan' | 'emerald_mist' | 'golden_flare' | 'violet_matrix';
  cameraSuggestedMode?: 'chase' | 'horizon' | 'dragon_pov' | 'orbit';
}

export const VISUAL_ROOMS: RoomTheme[] = [
  {
    id: "room-01-pacific-sunset",
    number: 1,
    name: "Pacific Horizon",
    subtitle: "West Coast Sunset Sanctuary",
    category: "Atmospheric",
    description: "Expansive ocean swell under warm sunset fuchsia and solar gold, with glowing cyan horizon wireframe and soaring alpha cyber dragons.",
    fogColor: 0x050412,
    fogDensity: 0.0019,
    ambientColor: 0x1a1236,
    keyLightColor: 0xff7722,
    rimLightColor: 0x00f0ff,
    fillLightColor: 0x8a2be2,
    palette: {
      baseDark: [0.012, 0.02, 0.06],
      secondary: [0.05, 0.04, 0.22],
      vibrant1: [0.48, 0.12, 0.88],
      vibrant2: [0.96, 0.15, 0.52],
      accent: [0.12, 0.88, 0.95]
    },
    dragonColors: {
      alphaPrimary: 0x0a1832,
      alphaEmissive: 0x06b6d4,
      betaPrimary: 0x24061a,
      betaEmissive: 0xf43f5e,
      gammaPrimary: 0x140a28,
      gammaEmissive: 0xa855f7
    },
    geometryType: "horizon_grid",
    plasmaStyle: "liquid_fire",
    cameraSuggestedMode: "chase"
  },
  {
    id: "room-02-cyber-tokyo",
    number: 2,
    name: "Neon Shibuya Grid",
    subtitle: "High-Density Cyber Megacity",
    category: "Cyberpunk",
    description: "Vertical neon skyscrapers and wet reflective cyber gridlines pulsing with electric fuchsia and cyan transients.",
    fogColor: 0x03030a,
    fogDensity: 0.0024,
    ambientColor: 0x081024,
    keyLightColor: 0x00ffff,
    rimLightColor: 0xff007f,
    fillLightColor: 0x220055,
    palette: {
      baseDark: [0.01, 0.01, 0.03],
      secondary: [0.02, 0.06, 0.18],
      vibrant1: [0.0, 0.85, 0.95],
      vibrant2: [1.0, 0.05, 0.55],
      accent: [0.4, 0.95, 1.0]
    },
    dragonColors: {
      alphaPrimary: 0x02121a,
      alphaEmissive: 0x00ffff,
      betaPrimary: 0x200215,
      betaEmissive: 0xff006e,
      gammaPrimary: 0x0e0220,
      gammaEmissive: 0x9d4edd
    },
    geometryType: "cyber_monoliths",
    plasmaStyle: "ionized_cyan",
    cameraSuggestedMode: "orbit"
  },
  {
    id: "room-03-quantum-nebula",
    number: 3,
    name: "Quantum Nebula",
    subtitle: "Deep Interstellar Void",
    category: "Cosmic",
    description: "Volumetric interstellar dust clouds and spiraling stardust particles reacting to low-frequency sub-bass gravitational waves.",
    fogColor: 0x020108,
    fogDensity: 0.0016,
    ambientColor: 0x120824,
    keyLightColor: 0x9333ea,
    rimLightColor: 0x3b82f6,
    fillLightColor: 0xec4899,
    palette: {
      baseDark: [0.008, 0.005, 0.02],
      secondary: [0.08, 0.02, 0.18],
      vibrant1: [0.55, 0.15, 0.92],
      vibrant2: [0.2, 0.45, 0.98],
      accent: [0.95, 0.25, 0.75]
    },
    dragonColors: {
      alphaPrimary: 0x120422,
      alphaEmissive: 0xc084fc,
      betaPrimary: 0x04142a,
      betaEmissive: 0x60a5fa,
      gammaPrimary: 0x220418,
      gammaEmissive: 0xf472b6
    },
    geometryType: "cosmic_nebula",
    plasmaStyle: "violet_matrix",
    cameraSuggestedMode: "horizon"
  },
  {
    id: "room-04-malibu-synthwave",
    number: 4,
    name: "Malibu Synth Palms",
    subtitle: "Outrun 1986 Wireframe",
    category: "Retro-Future",
    description: "Vector wireframe highway running towards a giant striped solar emitter, lined with glowing cyber palm geometries.",
    fogColor: 0x08020a,
    fogDensity: 0.002,
    ambientColor: 0x260a1e,
    keyLightColor: 0xff3366,
    rimLightColor: 0xffbb00,
    fillLightColor: 0x7700bb,
    palette: {
      baseDark: [0.02, 0.005, 0.03],
      secondary: [0.15, 0.02, 0.12],
      vibrant1: [1.0, 0.18, 0.42],
      vibrant2: [1.0, 0.75, 0.1],
      accent: [0.95, 0.1, 0.6]
    },
    dragonColors: {
      alphaPrimary: 0x280210,
      alphaEmissive: 0xf43f5e,
      betaPrimary: 0x241402,
      betaEmissive: 0xfbbf24,
      gammaPrimary: 0x180222,
      gammaEmissive: 0xd946ef
    },
    geometryType: "retro_synth",
    plasmaStyle: "liquid_fire",
    cameraSuggestedMode: "chase"
  },
  {
    id: "room-05-emerald-aurora",
    number: 5,
    name: "Emerald Aurora",
    subtitle: "Arctic Polar Resonance",
    category: "Spectral",
    description: "Undulating celestial curtains of bioluminescent emerald and mint green, reacting to mid-range vocal and synthesizer harmonics.",
    fogColor: 0x010806,
    fogDensity: 0.0022,
    ambientColor: 0x042018,
    keyLightColor: 0x10b981,
    rimLightColor: 0x06b6d4,
    fillLightColor: 0x047857,
    palette: {
      baseDark: [0.005, 0.03, 0.02],
      secondary: [0.01, 0.12, 0.08],
      vibrant1: [0.06, 0.75, 0.52],
      vibrant2: [0.05, 0.85, 0.75],
      accent: [0.4, 1.0, 0.6]
    },
    dragonColors: {
      alphaPrimary: 0x021c12,
      alphaEmissive: 0x34d399,
      betaPrimary: 0x02181c,
      betaEmissive: 0x22d3ee,
      gammaPrimary: 0x08240a,
      gammaEmissive: 0x4ade80
    },
    geometryType: "aurora_curtains",
    plasmaStyle: "emerald_mist",
    cameraSuggestedMode: "dragon_pov"
  },
  {
    id: "room-06-solar-corona",
    number: 6,
    name: "Solar Helios",
    subtitle: "Thermonuclear Plasma Core",
    category: "Energetic",
    description: "Molten obsidian ridges drenched in violent solar prominences, magma amber turbulence, and incendiary beat transients.",
    fogColor: 0x0c0401,
    fogDensity: 0.0025,
    ambientColor: 0x2e0800,
    keyLightColor: 0xff4500,
    rimLightColor: 0xffaa00,
    fillLightColor: 0x8b0000,
    palette: {
      baseDark: [0.03, 0.008, 0.002],
      secondary: [0.2, 0.04, 0.01],
      vibrant1: [0.95, 0.22, 0.05],
      vibrant2: [1.0, 0.65, 0.05],
      accent: [1.0, 0.9, 0.4]
    },
    dragonColors: {
      alphaPrimary: 0x2e0501,
      alphaEmissive: 0xff5722,
      betaPrimary: 0x281200,
      betaEmissive: 0xff9800,
      gammaPrimary: 0x1f0202,
      gammaEmissive: 0xf44336
    },
    geometryType: "solar_magma",
    plasmaStyle: "golden_flare",
    cameraSuggestedMode: "chase"
  },
  {
    id: "room-07-crystal-prism",
    number: 7,
    name: "Crystal Matrix",
    subtitle: "Refractive Holographic Prisms",
    category: "Geometric",
    description: "Multi-faceted geometric diamond spires that split incoming light into chromatic spectral dispersion rings on high treble audio hits.",
    fogColor: 0x04050d,
    fogDensity: 0.0018,
    ambientColor: 0x0e1428,
    keyLightColor: 0x60a5fa,
    rimLightColor: 0xe879f9,
    fillLightColor: 0x38bdf8,
    palette: {
      baseDark: [0.01, 0.015, 0.04],
      secondary: [0.04, 0.08, 0.2],
      vibrant1: [0.35, 0.65, 0.98],
      vibrant2: [0.85, 0.45, 0.95],
      accent: [0.9, 0.95, 1.0]
    },
    dragonColors: {
      alphaPrimary: 0x061226,
      alphaEmissive: 0x38bdf8,
      betaPrimary: 0x1c0624,
      betaEmissive: 0xe879f9,
      gammaPrimary: 0x081e28,
      gammaEmissive: 0x2dd4bf
    },
    geometryType: "crystal_prism",
    plasmaStyle: "ionized_cyan",
    cameraSuggestedMode: "orbit"
  },
  {
    id: "room-08-abyssal-trench",
    number: 8,
    name: "Abyssal Mariana",
    subtitle: "Bioluminescent Hydrothermal Rift",
    category: "Sub-Aquatic",
    description: "Deep oceanic midnight zone where bioluminescent hydrothermal vents ignite organic neon particle plumes reacting to heavy 808 sub-bass.",
    fogColor: 0x010308,
    fogDensity: 0.0028,
    ambientColor: 0x020e18,
    keyLightColor: 0x0284c7,
    rimLightColor: 0x06b6d4,
    fillLightColor: 0x0369a1,
    palette: {
      baseDark: [0.003, 0.01, 0.025],
      secondary: [0.01, 0.05, 0.12],
      vibrant1: [0.02, 0.5, 0.8],
      vibrant2: [0.05, 0.8, 0.85],
      accent: [0.3, 0.95, 0.98]
    },
    dragonColors: {
      alphaPrimary: 0x011422,
      alphaEmissive: 0x0284c7,
      betaPrimary: 0x011a1e,
      betaEmissive: 0x06b6d4,
      gammaPrimary: 0x021e16,
      gammaEmissive: 0x10b981
    },
    geometryType: "abyssal_deep",
    plasmaStyle: "ionized_cyan",
    cameraSuggestedMode: "dragon_pov"
  },
  {
    id: "room-09-chrono-warp",
    number: 9,
    name: "Chrono Warp Tunnel",
    subtitle: "Relativistic Light-Speed Conduit",
    category: "Kinetic",
    description: "Curved hyperspace light tunnel with relativistic Doppler streaks that expand and accelerate with musical tempo and beat frequency.",
    fogColor: 0x06010d,
    fogDensity: 0.0017,
    ambientColor: 0x180424,
    keyLightColor: 0xd946ef,
    rimLightColor: 0x8b5cf6,
    fillLightColor: 0x6366f1,
    palette: {
      baseDark: [0.015, 0.004, 0.03],
      secondary: [0.1, 0.02, 0.2],
      vibrant1: [0.82, 0.25, 0.92],
      vibrant2: [0.45, 0.35, 0.95],
      accent: [1.0, 0.5, 0.85]
    },
    dragonColors: {
      alphaPrimary: 0x220224,
      alphaEmissive: 0xf43f5e,
      betaPrimary: 0x120228,
      betaEmissive: 0xa855f7,
      gammaPrimary: 0x04082c,
      gammaEmissive: 0x6366f1
    },
    geometryType: "chrono_warp",
    plasmaStyle: "violet_matrix",
    cameraSuggestedMode: "chase"
  },
  {
    id: "room-10-sovereign-gold",
    number: 10,
    name: "Sovereign Sanctuary",
    subtitle: "The Fluid Motion of the Future Codex",
    category: "Architectural",
    description: "Sacred golden holographic monoliths and mirror-black marble obelisks radiating sovereign amber light in harmonic synthesis.",
    fogColor: 0x070502,
    fogDensity: 0.002,
    ambientColor: 0x241a08,
    keyLightColor: 0xf59e0b,
    rimLightColor: 0xfef08a,
    fillLightColor: 0xd97706,
    palette: {
      baseDark: [0.02, 0.015, 0.005],
      secondary: [0.12, 0.08, 0.02],
      vibrant1: [0.85, 0.55, 0.1],
      vibrant2: [0.95, 0.78, 0.22],
      accent: [1.0, 0.95, 0.6]
    },
    dragonColors: {
      alphaPrimary: 0x261a04,
      alphaEmissive: 0xf59e0b,
      betaPrimary: 0x1e1202,
      betaEmissive: 0xd97706,
      gammaPrimary: 0x2a2206,
      gammaEmissive: 0xfef08a
    },
    geometryType: "sovereign_gold",
    plasmaStyle: "golden_flare",
    cameraSuggestedMode: "orbit"
  }
];
