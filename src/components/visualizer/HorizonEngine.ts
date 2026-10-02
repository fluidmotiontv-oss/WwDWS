import * as THREE from 'three';
import { AudioMetrics } from '../../services/audioEngine';

/**
 * Expansive Deep-Field "Horizon Engine" Visualizer
 * Fluid, glowing, reactive color gradients (West Coast sunset palette)
 * Real-time FFT frequency response
 */
export class HorizonEngine {
  public group: THREE.Group;
  private terrainMesh: THREE.Mesh;
  private celestialSun: THREE.Mesh;
  private gridMesh: THREE.Mesh;
  private terrainMaterial: THREE.ShaderMaterial;
  private sunMaterial: THREE.ShaderMaterial;

  constructor() {
    this.group = new THREE.Group();

    // 1. Terrain & Ocean Plane with Custom Reactive GLSL Shader
    const planeGeo = new THREE.PlaneGeometry(1600, 1600, 160, 160);
    planeGeo.rotateX(-Math.PI / 2);

    this.terrainMaterial = new THREE.ShaderMaterial({
      wireframe: false,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uTreble: { value: 0 },
        uBeat: { value: 0 },
        uBeatAccumulator: { value: 0 },
        uSunPosition: { value: new THREE.Vector3(0, 80, -650) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uBeatAccumulator;
        
        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormalVec;
        varying vec3 vWorldPos;

        // Simplex-style noise helper
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Horizon swell & Bass elevation
          float distanceFade = smoothstep(50.0, 700.0, abs(pos.z));
          float wave1 = snoise(pos.xz * 0.003 + vec2(0.0, uTime * 0.25)) * (28.0 + uBass * 70.0);
          float wave2 = sin(pos.x * 0.015 + uTime * 0.8) * cos(pos.z * 0.01 + uTime * 0.6) * (14.0 + uMid * 32.0);
          float ripple = sin(length(pos.xz) * 0.05 - uBeatAccumulator * 3.0) * (uTreble * 10.0);

          // Mountainous side ridges to frame the central horizon channel
          float sideRidge = smoothstep(120.0, 500.0, abs(pos.x)) * (snoise(pos.xz * 0.006) * 110.0 + 40.0);

          float totalElevation = (wave1 + wave2 + ripple) * (1.0 - distanceFade * 0.4) + sideRidge;
          pos.y += totalElevation;
          vElevation = totalElevation;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;
          vNormalVec = normalize(normalMatrix * normal);

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uBeat;
        uniform vec3 uSunPosition;

        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormalVec;
        varying vec3 vWorldPos;

        void main() {
          // West Coast Sunset Color Spectrum:
          // Deep Pacific Blue -> Neon Violet -> Hot Sunset Magenta -> Solar Orange -> Golden Cyan
          vec3 pacificDeep = vec3(0.012, 0.02, 0.06);     // #030510
          vec3 pacificNavy = vec3(0.05, 0.04, 0.22);     // #0d0a38
          vec3 neonViolet  = vec3(0.48, 0.12, 0.88);     // #7b1ee0
          vec3 sunsetPink  = vec3(0.96, 0.15, 0.52);     // #f52685
          vec3 solarGold   = vec3(1.0, 0.65, 0.15);      // #ffa626
          vec3 horizonCyan = vec3(0.12, 0.88, 0.95);     // #1fe0f2

          // Normalize depth along z
          float depthFactor = clamp((-vWorldPos.z + 100.0) / 900.0, 0.0, 1.0);
          float elevationFactor = clamp((vElevation + 30.0) / 110.0, 0.0, 1.0);

          // Base color blend
          vec3 color = mix(pacificDeep, pacificNavy, elevationFactor);
          color = mix(color, neonViolet, smoothstep(0.2, 0.6, elevationFactor) * (0.8 + uBass * 0.4));
          color = mix(color, sunsetPink, smoothstep(0.5, 0.85, elevationFactor) * (0.7 + uMid * 0.5));
          color = mix(color, solarGold, smoothstep(0.75, 1.0, elevationFactor) * (0.6 + uTreble * 0.6));

          // Horizon atmospheric sunset glow
          float horizonGlow = pow(depthFactor, 2.4);
          color = mix(color, mix(sunsetPink, solarGold, 0.5 + 0.5 * sin(uTime * 0.5)), horizonGlow * 0.85);

          // Cybernetic grid lines over terrain
          vec2 grid = abs(fract(vWorldPos.xz * 0.04 - 0.5) - 0.5) / fwidth(vWorldPos.xz * 0.04);
          float line = min(grid.x, grid.y);
          float gridFactor = 1.0 - min(line, 1.0);
          
          vec3 gridColor = mix(neonViolet, horizonCyan, uTreble);
          color += gridColor * gridFactor * (0.35 + uTreble * 0.8) * (1.0 - horizonGlow * 0.5);

          // Beat pulse flash on peaks
          if (uBeat > 0.4) {
            color += sunsetPink * (uBeat - 0.4) * 0.8 * elevationFactor;
          }

          // Distance fog falloff
          float dist = length(vWorldPos.xz);
          float fog = smoothstep(200.0, 850.0, dist);
          color = mix(color, vec3(0.03, 0.02, 0.08), fog * 0.85);

          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.terrainMesh = new THREE.Mesh(planeGeo, this.terrainMaterial);
    this.terrainMesh.position.set(0, -35, 0);
    this.group.add(this.terrainMesh);

    // 2. Wireframe Overlay Geometry for High-Tech Cyber Perspective
    const gridGeo = new THREE.PlaneGeometry(1600, 1600, 40, 40);
    gridGeo.rotateX(-Math.PI / 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    this.gridMesh = new THREE.Mesh(gridGeo, wireMat);
    this.gridMesh.position.set(0, -34.5, 0);
    this.group.add(this.gridMesh);

    // 3. Iconic West Coast Solar Disc on Horizon
    const sunGeo = new THREE.CircleGeometry(160, 64);
    this.sunMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uBeat: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uBass;
        uniform float uBeat;
        varying vec2 vUv;

        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;

          // Striped retro-synthwave horizontal cuts
          float lines = sin((vUv.y + uTime * 0.05) * 45.0);
          float cut = smoothstep(-0.2, 0.1, lines);
          if (vUv.y < 0.45 && cut > 0.6) discard;

          // Gradient: Solar Yellow at top -> Hot Pink at bottom
          vec3 sunTop = vec3(1.0, 0.85, 0.2);
          vec3 sunBottom = vec3(0.98, 0.18, 0.55);
          vec3 col = mix(sunBottom, sunTop, vUv.y);

          // Corona glow
          float glow = pow(1.0 - dist * 2.0, 1.8);
          col += vec3(1.0, 0.4, 0.1) * (uBass * 0.8 + uBeat * 0.6);

          gl_FragColor = vec4(col, glow * 0.95);
        }
      `
    });

    this.celestialSun = new THREE.Mesh(sunGeo, this.sunMaterial);
    this.celestialSun.position.set(0, 95, -720);
    this.group.add(this.celestialSun);

    // 4. Distant Horizon Starfield / Cosmic Particles
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 1200;
      starPos[i * 3 + 1] = Math.random() * 350 + 20;
      starPos[i * 3 + 2] = -Math.random() * 800 - 100;

      // Color variation (cyan, magenta, gold, white)
      const rChoice = Math.random();
      if (rChoice < 0.3) {
        // Cyan
        starColors[i * 3] = 0.2;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      } else if (rChoice < 0.6) {
        // Magenta / Pink
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.3;
        starColors[i * 3 + 2] = 0.8;
      } else {
        // Gold / White
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.6;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    this.group.add(starParticles);
  }

  public update(time: number, metrics: AudioMetrics) {
    this.terrainMaterial.uniforms.uTime.value = time;
    this.terrainMaterial.uniforms.uBass.value = metrics.bass;
    this.terrainMaterial.uniforms.uMid.value = metrics.mid;
    this.terrainMaterial.uniforms.uTreble.value = metrics.treble;
    this.terrainMaterial.uniforms.uBeat.value = metrics.beatStrength;
    this.terrainMaterial.uniforms.uBeatAccumulator.value = metrics.beatAccumulator;

    this.sunMaterial.uniforms.uTime.value = time;
    this.sunMaterial.uniforms.uBass.value = metrics.bass;
    this.sunMaterial.uniforms.uBeat.value = metrics.beatStrength;

    // Subtle sun pulsation on bass
    const sunScale = 1.0 + (metrics.bass * 0.18) + (metrics.beatStrength * 0.25);
    this.celestialSun.scale.set(sunScale, sunScale, 1.0);
  }
}
