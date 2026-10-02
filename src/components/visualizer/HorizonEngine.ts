import * as THREE from 'three';
import { AudioMetrics } from '../../services/audioEngine';
import { RoomTheme } from '../../data/roomsManifest';

/**
 * Expansive Deep-Field "Horizon Engine" Visualizer
 * Fluid, glowing, reactive color gradients dynamically modulated by Room Themes
 * Real-time FFT frequency response
 */
export class HorizonEngine {
  public group: THREE.Group;
  private terrainMesh: THREE.Mesh;
  private celestialSun: THREE.Mesh;
  private gridMesh: THREE.Mesh;
  private terrainMaterial: THREE.ShaderMaterial;
  private sunMaterial: THREE.ShaderMaterial;

  // Architectural & Dimensional Geometry Sets for Rooms
  private monolithsGroup: THREE.Group;
  private crystalsGroup: THREE.Group;
  private warpRingsGroup: THREE.Group;
  private crystals: THREE.Mesh[] = [];
  private warpRings: THREE.Mesh[] = [];
  private monoliths: THREE.Mesh[] = [];

  // Target and current color vectors for smooth lerping
  private targetColDark = new THREE.Vector3(0.012, 0.02, 0.06);
  private targetColSecondary = new THREE.Vector3(0.05, 0.04, 0.22);
  private targetColVibrant1 = new THREE.Vector3(0.48, 0.12, 0.88);
  private targetColVibrant2 = new THREE.Vector3(0.96, 0.15, 0.52);
  private targetColAccent = new THREE.Vector3(0.12, 0.88, 0.95);

  private currentColDark = new THREE.Vector3(0.012, 0.02, 0.06);
  private currentColSecondary = new THREE.Vector3(0.05, 0.04, 0.22);
  private currentColVibrant1 = new THREE.Vector3(0.48, 0.12, 0.88);
  private currentColVibrant2 = new THREE.Vector3(0.96, 0.15, 0.52);
  private currentColAccent = new THREE.Vector3(0.12, 0.88, 0.95);

  private activeGeometryType: string = 'horizon_grid';

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
        uColDark: { value: this.currentColDark },
        uColSecondary: { value: this.currentColSecondary },
        uColVibrant1: { value: this.currentColVibrant1 },
        uColVibrant2: { value: this.currentColVibrant2 },
        uColAccent: { value: this.currentColAccent }
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

          float distanceFade = smoothstep(50.0, 700.0, abs(pos.z));
          float wave1 = snoise(pos.xz * 0.003 + vec2(0.0, uTime * 0.25)) * (28.0 + uBass * 70.0);
          float wave2 = sin(pos.x * 0.015 + uTime * 0.8) * cos(pos.z * 0.01 + uTime * 0.6) * (14.0 + uMid * 32.0);
          float ripple = sin(length(pos.xz) * 0.05 - uBeatAccumulator * 3.0) * (uTreble * 10.0);

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
        uniform vec3 uColDark;
        uniform vec3 uColSecondary;
        uniform vec3 uColVibrant1;
        uniform vec3 uColVibrant2;
        uniform vec3 uColAccent;

        varying vec2 vUv;
        varying float vElevation;
        varying vec3 vNormalVec;
        varying vec3 vWorldPos;

        void main() {
          float depthFactor = clamp((-vWorldPos.z + 100.0) / 900.0, 0.0, 1.0);
          float elevationFactor = clamp((vElevation + 30.0) / 110.0, 0.0, 1.0);

          vec3 color = mix(uColDark, uColSecondary, elevationFactor);
          color = mix(color, uColVibrant1, smoothstep(0.2, 0.6, elevationFactor) * (0.8 + uBass * 0.4));
          color = mix(color, uColVibrant2, smoothstep(0.5, 0.85, elevationFactor) * (0.7 + uMid * 0.5));
          color = mix(color, uColAccent, smoothstep(0.75, 1.0, elevationFactor) * (0.6 + uTreble * 0.6));

          float horizonGlow = pow(depthFactor, 2.4);
          color = mix(color, mix(uColVibrant2, uColAccent, 0.5 + 0.5 * sin(uTime * 0.5)), horizonGlow * 0.85);

          vec2 grid = abs(fract(vWorldPos.xz * 0.04 - 0.5) - 0.5) / fwidth(vWorldPos.xz * 0.04);
          float line = min(grid.x, grid.y);
          float gridFactor = 1.0 - min(line, 1.0);
          
          vec3 gridColor = mix(uColVibrant1, uColAccent, uTreble);
          color += gridColor * gridFactor * (0.35 + uTreble * 0.8) * (1.0 - horizonGlow * 0.5);

          if (uBeat > 0.4) {
            color += uColVibrant2 * (uBeat - 0.4) * 0.8 * elevationFactor;
          }

          float dist = length(vWorldPos.xz);
          float fog = smoothstep(200.0, 850.0, dist);
          color = mix(color, uColDark * 1.5, fog * 0.85);

          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.terrainMesh = new THREE.Mesh(planeGeo, this.terrainMaterial);
    this.terrainMesh.position.set(0, -35, 0);
    this.group.add(this.terrainMesh);

    // 2. Wireframe Overlay
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

    // 3. Solar Disc / Celestial Portal
    const sunGeo = new THREE.CircleGeometry(160, 64);
    this.sunMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uBeat: { value: 0 },
        uSunColor: { value: new THREE.Vector3(1.0, 0.4, 0.1) }
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
        uniform vec3 uSunColor;
        varying vec2 vUv;

        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;

          float lines = sin((vUv.y + uTime * 0.05) * 45.0);
          float cut = smoothstep(-0.2, 0.1, lines);
          if (vUv.y < 0.45 && cut > 0.6) discard;

          vec3 sunTop = uSunColor * 1.3;
          vec3 sunBottom = uSunColor * 0.6;
          vec3 col = mix(sunBottom, sunTop, vUv.y);

          float glow = pow(1.0 - dist * 2.0, 1.8);
          col += uSunColor * (uBass * 0.8 + uBeat * 0.6);

          gl_FragColor = vec4(col, glow * 0.95);
        }
      `
    });

    this.celestialSun = new THREE.Mesh(sunGeo, this.sunMaterial);
    this.celestialSun.position.set(0, 95, -720);
    this.group.add(this.celestialSun);

    // 4. Distant Horizon Starfield
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 1200;
      starPos[i * 3 + 1] = Math.random() * 350 + 20;
      starPos[i * 3 + 2] = -Math.random() * 800 - 100;

      starColors[i * 3] = 0.5 + Math.random() * 0.5;
      starColors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      starColors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
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
    this.group.add(new THREE.Points(starGeo, starMat));

    // 5. Monoliths Set (Shibuya & Sovereign Gold)
    this.monolithsGroup = new THREE.Group();
    const monoGeo = new THREE.BoxGeometry(14, 180, 14);
    for (let i = 0; i < 20; i++) {
      const monoMat = new THREE.MeshStandardMaterial({
        color: 0x050510,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0x00ffff,
        emissiveIntensity: 0.8
      });
      const mono = new THREE.Mesh(monoGeo, monoMat);
      const angle = (i / 20) * Math.PI * 2;
      const rad = 280 + (i % 3) * 60;
      mono.position.set(Math.sin(angle) * rad, 35, -200 + Math.cos(angle) * rad);
      mono.scale.set(1.0, 0.4 + Math.random() * 0.8, 1.0);
      this.monoliths.push(mono);
      this.monolithsGroup.add(mono);
    }
    this.monolithsGroup.visible = false;
    this.group.add(this.monolithsGroup);

    // 6. Crystal Prisms Set (Crystal Matrix)
    this.crystalsGroup = new THREE.Group();
    const octGeo = new THREE.OctahedronGeometry(12, 0);
    for (let i = 0; i < 16; i++) {
      const crystalMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        emissive: 0x38bdf8,
        emissiveIntensity: 1.2,
        roughness: 0.05,
        transmission: 0.8,
        thickness: 4.0,
        metalness: 0.1
      });
      const crystal = new THREE.Mesh(octGeo, crystalMat);
      crystal.position.set(
        (Math.random() - 0.5) * 450,
        30 + Math.random() * 80,
        -100 - Math.random() * 350
      );
      this.crystals.push(crystal);
      this.crystalsGroup.add(crystal);
    }
    this.crystalsGroup.visible = false;
    this.group.add(this.crystalsGroup);

    // 7. Chrono Warp Rings Set (Chrono Warp Tunnel)
    this.warpRingsGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(55, 1.5, 8, 32);
    for (let i = 0; i < 12; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd946ef,
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 50, -i * 55 - 50);
      this.warpRings.push(ring);
      this.warpRingsGroup.add(ring);
    }
    this.warpRingsGroup.visible = false;
    this.group.add(this.warpRingsGroup);
  }

  public applyRoomTheme(theme: RoomTheme) {
    this.activeGeometryType = theme.geometryType;

    const p = theme.palette;
    this.targetColDark.set(...p.baseDark);
    this.targetColSecondary.set(...p.secondary);
    this.targetColVibrant1.set(...p.vibrant1);
    this.targetColVibrant2.set(...p.vibrant2);
    this.targetColAccent.set(...p.accent);

    // Sun color
    this.sunMaterial.uniforms.uSunColor.value.set(
      (theme.keyLightColor >> 16 & 255) / 255,
      (theme.keyLightColor >> 8 & 255) / 255,
      (theme.keyLightColor & 255) / 255
    );

    // Toggle geometry sets
    this.monolithsGroup.visible = theme.geometryType === 'cyber_monoliths' || theme.geometryType === 'sovereign_gold';
    this.crystalsGroup.visible = theme.geometryType === 'crystal_prism';
    this.warpRingsGroup.visible = theme.geometryType === 'chrono_warp';

    // Adjust monolith colors
    if (theme.geometryType === 'sovereign_gold') {
      this.monoliths.forEach(m => {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(0xf59e0b);
        mat.color.setHex(0x181004);
      });
    } else if (theme.geometryType === 'cyber_monoliths') {
      this.monoliths.forEach((m, idx) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(idx % 2 === 0 ? 0x00ffff : 0xff007f);
        mat.color.setHex(0x050512);
      });
    }
  }

  public update(time: number, metrics: AudioMetrics) {
    // Smooth lerp color uniforms towards room target
    this.currentColDark.lerp(this.targetColDark, 0.05);
    this.currentColSecondary.lerp(this.targetColSecondary, 0.05);
    this.currentColVibrant1.lerp(this.targetColVibrant1, 0.05);
    this.currentColVibrant2.lerp(this.targetColVibrant2, 0.05);
    this.currentColAccent.lerp(this.targetColAccent, 0.05);

    this.terrainMaterial.uniforms.uTime.value = time;
    this.terrainMaterial.uniforms.uBass.value = metrics.bass;
    this.terrainMaterial.uniforms.uMid.value = metrics.mid;
    this.terrainMaterial.uniforms.uTreble.value = metrics.treble;
    this.terrainMaterial.uniforms.uBeat.value = metrics.beatStrength;
    this.terrainMaterial.uniforms.uBeatAccumulator.value = metrics.beatAccumulator;

    this.sunMaterial.uniforms.uTime.value = time;
    this.sunMaterial.uniforms.uBass.value = metrics.bass;
    this.sunMaterial.uniforms.uBeat.value = metrics.beatStrength;

    const sunScale = 1.0 + (metrics.bass * 0.18) + (metrics.beatStrength * 0.25);
    this.celestialSun.scale.set(sunScale, sunScale, 1.0);

    // Animate room geometry sets
    if (this.crystalsGroup.visible) {
      this.crystals.forEach((c, idx) => {
        c.rotation.x = time * 0.4 + idx;
        c.rotation.y = time * 0.6 + idx;
        c.scale.setScalar(1.0 + metrics.treble * 0.4);
      });
    }

    if (this.warpRingsGroup.visible) {
      const speed = 80 + metrics.beatStrength * 160;
      this.warpRings.forEach((ring) => {
        ring.position.z += 0.016 * speed;
        if (ring.position.z > 80) {
          ring.position.z = -550;
        }
        ring.scale.setScalar(1.0 + metrics.bass * 0.2);
      });
    }

    if (this.monolithsGroup.visible) {
      const bounce = metrics.bass * 20;
      this.monoliths.forEach((m, idx) => {
        m.position.y = 35 + Math.sin(time * 2.0 + idx) * 5 + bounce;
      });
    }
  }
}
