import * as THREE from 'three';
import { AudioMetrics } from '../../services/audioEngine';

/**
 * Interactive Plasma FX Surface
 * Liquid fire / ionized gas shader that ripples aggressively under pointer/touch interaction
 * Modulated by FFT bass transients and high-frequency sparks.
 */
export class PlasmaSurface {
  public mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private pointer: THREE.Vector2 = new THREE.Vector2(0.5, 0.5);
  private pointerVelocity: number = 0;
  private pointerActive: number = 0;
  private lastPointerPos: THREE.Vector2 = new THREE.Vector2(0.5, 0.5);

  constructor() {
    // Large curved or planar foreground plasma canopy
    const geometry = new THREE.PlaneGeometry(360, 220, 64, 64);

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uPointerVelocity: { value: 0.0 },
        uPointerActive: { value: 0.0 },
        uBass: { value: 0.0 },
        uMid: { value: 0.0 },
        uTreble: { value: 0.0 },
        uBeat: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPos;

        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uPointer;
        uniform float uPointerVelocity;
        uniform float uPointerActive;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uBeat;

        varying vec2 vUv;
        varying vec3 vWorldPos;

        // Simplex / Perlin noise helpers
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

        // Fractional Brownian Motion
        float fbm(vec2 p) {
          float val = 0.0;
          float amp = 0.5;
          float freq = 1.0;
          for (int i = 0; i < 4; i++) {
            val += amp * snoise(p * freq);
            freq *= 2.1;
            amp *= 0.48;
          }
          return val;
        }

        void main() {
          vec2 uv = vUv;
          
          // Distance from active mouse/touch pointer
          vec2 pointerCoord = uPointer;
          // Invert Y coordinate if needed to align screen space
          float dist = distance(uv, pointerCoord);

          // 1. Aggressive ripple & displacement near cursor
          float rippleFreq = 28.0;
          float rippleSpeed = 12.0;
          float rippleWave = sin(dist * rippleFreq - uTime * rippleSpeed) * exp(-dist * 5.5);
          
          // Cursor vortex swirl
          vec2 toPointer = uv - pointerCoord;
          float swirlStrength = (1.0 / (dist * 18.0 + 1.0)) * (0.15 + uPointerVelocity * 0.4) * uPointerActive;
          vec2 warpedUv = uv + vec2(-toPointer.y, toPointer.x) * swirlStrength + normalize(toPointer + 0.0001) * rippleWave * 0.08 * uPointerActive;

          // 2. Domain Warped Liquid Fire / Ionized Gas Field
          vec2 p = warpedUv * 4.2;
          float t = uTime * (0.35 + uBass * 0.6);

          vec2 q = vec2(fbm(p + vec2(t * 0.2, t * 0.15)), fbm(p + vec2(4.2, 1.8)));
          vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.2, 9.2) + t * 0.3), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.2));
          float f = fbm(p + 3.5 * r + vec2(t * 0.1, 0.0));

          // Normalize f into 0 to 1
          float plasmaVal = clamp((f + 0.6) * 0.8, 0.0, 1.0);

          // 3. Ionized Gas / West Coast Sunset Palette:
          // Violet -> Neon Magenta -> Radiant Amber -> Electric Cyan Core
          vec3 darkVoid   = vec3(0.02, 0.01, 0.05);
          vec3 neonViolet = vec3(0.55, 0.08, 0.85); // #8c14d9
          vec3 liquidPink = vec3(0.98, 0.18, 0.58); // #fa2e94
          vec3 hotAmber   = vec3(1.0, 0.62, 0.12);  // #ff9e1f
          vec3 ionizedCyan= vec3(0.15, 0.95, 1.0);  // #26f2ff

          vec3 color = mix(darkVoid, neonViolet, smoothstep(0.15, 0.45, plasmaVal));
          color = mix(color, liquidPink, smoothstep(0.45, 0.72, plasmaVal));
          color = mix(color, hotAmber, smoothstep(0.72, 0.92, plasmaVal));
          color = mix(color, ionizedCyan, smoothstep(0.90, 1.0, plasmaVal) * (0.8 + uTreble * 0.8));

          // 4. Cursor Hotspot: Concentrated ionized reaction ring
          float cursorGlow = exp(-dist * 6.5) * (0.8 + uPointerVelocity * 1.5) * uPointerActive;
          float cursorRing = smoothstep(0.08, 0.0, abs(dist - 0.12)) * (0.6 + uBeat * 0.8) * uPointerActive;
          
          color += (liquidPink * 1.2 + ionizedCyan * 1.5) * cursorGlow;
          color += ionizedCyan * cursorRing * 2.0;

          // 5. Audio Beat Flash & Electrical Scintillation
          if (uBeat > 0.3) {
            color += (liquidPink + hotAmber) * (uBeat - 0.3) * 0.9;
          }

          // Edge vignetting to smoothly blend into 3D scene
          float edgeFade = smoothstep(0.0, 0.18, uv.x) * smoothstep(1.0, 0.82, uv.x) *
                          smoothstep(0.0, 0.22, uv.y) * smoothstep(1.0, 0.78, uv.y);

          float alpha = clamp(plasmaVal * 0.55 + cursorGlow * 0.7 + uBeat * 0.2, 0.0, 0.85) * edgeFade;

          gl_FragColor = vec4(color, alpha);
        }
      `
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    // Positioned in the mid-foreground to create dramatic spatial depth
    this.mesh.position.set(0, 48, -120);
    this.mesh.rotation.x = -0.08;
  }

  public setPointer(normalizedX: number, normalizedY: number, isActive = true) {
    const newPos = new THREE.Vector2(normalizedX, 1.0 - normalizedY);
    const speed = newPos.distanceTo(this.lastPointerPos) * 60.0;
    this.pointerVelocity = THREE.MathUtils.lerp(this.pointerVelocity, Math.min(2.5, speed), 0.25);
    this.pointer.copy(newPos);
    this.lastPointerPos.copy(newPos);
    this.pointerActive = isActive ? 1.0 : 0.0;
  }

  public onResize(width: number, height: number) {
    this.material.uniforms.uResolution.value.set(width, height);
  }

  public update(time: number, metrics: AudioMetrics) {
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uPointer.value.copy(this.pointer);
    this.material.uniforms.uPointerVelocity.value = this.pointerVelocity;
    this.material.uniforms.uPointerActive.value = this.pointerActive;
    this.material.uniforms.uBass.value = metrics.bass;
    this.material.uniforms.uMid.value = metrics.mid;
    this.material.uniforms.uTreble.value = metrics.treble;
    this.material.uniforms.uBeat.value = metrics.beatStrength;

    // Decay velocity
    this.pointerVelocity *= 0.94;
  }
}
