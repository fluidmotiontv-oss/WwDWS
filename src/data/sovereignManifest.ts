export interface SovereignBookVolume {
  id: string;
  volumeNumber: number;
  title: string;
  subtitle: string;
  code: string;
  priceUSD: number;
  releaseStatus: 'live' | 'compiling' | 'queued';
  coverImage: string;
  synopsis: string;
  modulesCount: number;
  specifications: {
    format: string;
    renderResolution: string;
    audioCompanion: string;
    smartContractVerification: string;
  };
  tableOfContents: string[];
}

export interface LiveSalesTelemetryEvent {
  id: string;
  timestamp: string;
  operatorId: string;
  nodeRegion: string;
  volumeTitle: string;
  amountUSD: number;
  paymentMethod: 'PayPal Business API' | 'Verified Sovereign Token';
  transactionHash: string;
  status: 'SETTLED' | 'VERIFIED' | 'DISPATCHED';
}

export const SOVEREIGN_CATALOG: SovereignBookVolume[] = [
  {
    id: "vol-01-master",
    volumeNumber: 1,
    title: "The Fluid Motion of the Future",
    subtitle: "Introductory Master Edition",
    code: "FMF-VOL1-INTRO",
    priceUSD: 9.00,
    releaseStatus: "live",
    coverImage: "/src/assets/images/master_edition_cover_1790964000456.jpg",
    synopsis: "The foundational architectural codex detailing fluid dynamics, cybernetic flow states, and the convergence of real-time WebGL spatial mechanics with future media systems.",
    modulesCount: 7,
    specifications: {
      format: "Interactive 4K Digital Codex + Holographic 3D Asset Kit",
      renderResolution: "Master 4K 60fps Vector Layout",
      audioCompanion: "Lossless 24-bit West Coast Synthesizer Stems",
      smartContractVerification: "SHA-256 Tokenized License"
    },
    tableOfContents: [
      "01. Principles of Laminar & Turbulent Cyber-Flow",
      "02. Spatial Horizon Engines & Infinite Gradients",
      "03. Boids Flocking & Serpentine Kinematics",
      "04. Real-time Audio-Reactive FFT Transformation",
      "05. Plasma Dynamics & Ionized Liquid Surfaces",
      "06. Sovereign Web Node Deployment Architecture",
      "07. Telemetry & Instant Peer Settlement Protocols"
    ]
  },
  {
    id: "vol-02-temporal-grid",
    volumeNumber: 2,
    title: "Volume II: Temporal Grid",
    subtitle: "Chronometric Spatial Matrix",
    code: "FMF-VOL2-GRID",
    priceUSD: 19.00,
    releaseStatus: "compiling",
    coverImage: "/src/assets/images/temporal_grid_cover_1790964012034.jpg",
    synopsis: "Advanced multi-dimensional geometry and chronometric time-streams. Unlocking real-time holographic projection grids and quantum temporal navigation interfaces.",
    modulesCount: 9,
    specifications: {
      format: "Dynamic Volumetric Codex & GLSL Shader Library",
      renderResolution: "Real-time Vector-GPU Compute",
      audioCompanion: "Temporal Frequency Pulse Generators",
      smartContractVerification: "SHA-256 Grid Manifest Token"
    },
    tableOfContents: [
      "01. Dimensional Warp Matrices & Sub-Pixel Grids",
      "02. Non-Euclidean Wave Propagation Shaders",
      "03. Phase Cancellation in Real-time Web Audio",
      "04. Multi-Agent Flocking at Massive Scale",
      "05. Chrono-Spatial Memory Buffers"
    ]
  },
  {
    id: "vol-03-master-suite",
    volumeNumber: 3,
    title: "Volume III: Master Suite",
    subtitle: "Sovereign Architectural Synthesis",
    code: "FMF-VOL3-SUITE",
    priceUSD: 29.00,
    releaseStatus: "queued",
    coverImage: "/src/assets/images/master_suite_cover_1790964024550.jpg",
    synopsis: "The crowning operational suite for independent creative technologists, broadcast nodes, and autonomous high-performance visual computing pipelines.",
    modulesCount: 12,
    specifications: {
      format: "Full Sovereign Enterprise Bundle & Source Engine",
      renderResolution: "Zero-Latency WebGL/WebGPU Pipelines",
      audioCompanion: "Adaptive Generative Audio Synthesizer Runtime",
      smartContractVerification: "Immutable Node Identity Hash"
    },
    tableOfContents: [
      "01. Autonomous Broadcast Telemetry Engines",
      "02. Cryptographic Settlement & Direct Node Routing",
      "03. Sovereign Asset Pipeline Automation",
      "04. The Complete FluidmotionTV Production Playbook"
    ]
  }
];

export const INITIAL_TELEMETRY_LOGS: LiveSalesTelemetryEvent[] = [
  {
    id: "TX-990412",
    timestamp: "2026-10-02T10:48:12Z",
    operatorId: "OP-CALIF-883",
    nodeRegion: "US-WEST (Los Angeles Node #04)",
    volumeTitle: "Introductory Master Edition",
    amountUSD: 9.00,
    paymentMethod: "PayPal Business API",
    transactionHash: "0x8fa921c3b1e779a",
    status: "SETTLED"
  },
  {
    id: "TX-990413",
    timestamp: "2026-10-02T10:52:45Z",
    operatorId: "OP-NORCAL-104",
    nodeRegion: "US-WEST (San Francisco Node #02)",
    volumeTitle: "Introductory Master Edition",
    amountUSD: 9.00,
    paymentMethod: "PayPal Business API",
    transactionHash: "0x3d024b19c8f254e",
    status: "SETTLED"
  },
  {
    id: "TX-990414",
    timestamp: "2026-10-02T10:56:02Z",
    operatorId: "OP-PACIFIC-512",
    nodeRegion: "US-WEST (Seattle Node #09)",
    volumeTitle: "Introductory Master Edition",
    amountUSD: 9.00,
    paymentMethod: "PayPal Business API",
    transactionHash: "0x77bca2410f9e110",
    status: "SETTLED"
  }
];
