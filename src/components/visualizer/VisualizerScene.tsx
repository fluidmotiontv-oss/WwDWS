import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WestCoastAudioEngine, AudioMetrics } from '../../services/audioEngine';
import { HorizonEngine } from './HorizonEngine';
import { DragonFlock } from './DragonFlock';
import { PlasmaSurface } from './PlasmaSurface';
import { RoomTheme } from '../../data/roomsManifest';

export type CameraViewMode = 'chase' | 'horizon' | 'dragon_pov' | 'orbit';

interface VisualizerSceneProps {
  cameraMode: CameraViewMode;
  activeRoom: RoomTheme;
  onFpsUpdate?: (fps: number) => void;
  onMetricsUpdate?: (metrics: AudioMetrics) => void;
}

export const VisualizerScene: React.FC<VisualizerSceneProps> = ({
  cameraMode,
  activeRoom,
  onFpsUpdate,
  onMetricsUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const horizonRef = useRef<HorizonEngine | null>(null);
  const flockRef = useRef<DragonFlock | null>(null);
  const plasmaRef = useRef<PlasmaSurface | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Light references for smooth room morphing
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Orbit camera drag state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const orbitAngles = useRef({ theta: 0, phi: 0.15 });

  const [isWebGLError, setIsWebGLError] = useState(false);

  // Pointer interaction for plasma ripple
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !plasmaRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    plasmaRef.current.setPointer(x, y, true);

    if (isDragging.current && cameraMode === 'orbit') {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      orbitAngles.current.theta += deltaX * 0.005;
      orbitAngles.current.phi = Math.max(-0.2, Math.min(0.6, orbitAngles.current.phi - deltaY * 0.005));
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    }
  }, [cameraMode]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    if (plasmaRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      plasmaRef.current.setPointer(
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height,
        true
      );
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Update room theme when activeRoom changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (sceneRef.current.fog && sceneRef.current.fog instanceof THREE.FogExp2) {
      sceneRef.current.fog.color.setHex(activeRoom.fogColor);
      sceneRef.current.fog.density = activeRoom.fogDensity;
    }
    if (sceneRef.current.background instanceof THREE.Color) {
      sceneRef.current.background.setHex(activeRoom.fogColor);
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(activeRoom.ambientColor);
    }
    if (keyLightRef.current) {
      keyLightRef.current.color.setHex(activeRoom.keyLightColor);
    }
    if (rimLightRef.current) {
      rimLightRef.current.color.setHex(activeRoom.rimLightColor);
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.setHex(activeRoom.fillLightColor);
    }

    if (horizonRef.current) {
      horizonRef.current.applyRoomTheme(activeRoom);
    }
    if (flockRef.current) {
      flockRef.current.applyRoomTheme(activeRoom);
    }
    if (plasmaRef.current) {
      plasmaRef.current.applyRoomTheme(activeRoom);
    }
  }, [activeRoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. Scene & Depth Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(activeRoom.fogColor);
    scene.fog = new THREE.FogExp2(activeRoom.fogColor, activeRoom.fogDensity);
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.5, 2400);
    camera.position.set(0, 45, 120);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      rendererRef.current = renderer;
    } catch {
      setIsWebGLError(true);
      return;
    }

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(activeRoom.ambientColor, 1.2);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunsetKeyLight = new THREE.DirectionalLight(activeRoom.keyLightColor, 2.8);
    sunsetKeyLight.position.set(0, 90, -450);
    scene.add(sunsetKeyLight);
    keyLightRef.current = sunsetKeyLight;

    const cyanRimLight = new THREE.DirectionalLight(activeRoom.rimLightColor, 2.2);
    cyanRimLight.position.set(150, 100, 100);
    scene.add(cyanRimLight);
    rimLightRef.current = cyanRimLight;

    const violetFillLight = new THREE.DirectionalLight(activeRoom.fillLightColor, 1.6);
    violetFillLight.position.set(-150, 60, -100);
    scene.add(violetFillLight);
    fillLightRef.current = violetFillLight;

    // 5. Horizon Engine Visualizer
    const horizon = new HorizonEngine();
    horizon.applyRoomTheme(activeRoom);
    scene.add(horizon.group);
    horizonRef.current = horizon;

    // 6. Cyber Dragon Flock
    const flock = new DragonFlock();
    flock.applyRoomTheme(activeRoom);
    scene.add(flock.group);
    flockRef.current = flock;

    // 7. Interactive Plasma Surface
    const plasma = new PlasmaSurface();
    plasma.applyRoomTheme(activeRoom);
    scene.add(plasma.mesh);
    plasmaRef.current = plasma;
    plasma.onResize(width, height);

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      if (plasmaRef.current) {
        plasmaRef.current.onResize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // 9. Context Lost handling
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setIsWebGLError(true);
    };
    const onContextRestored = () => {
      setIsWebGLError(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // 10. Main Animation & Render Loop
    const audioEngine = WestCoastAudioEngine.getInstance();
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const currentCamPos = new THREE.Vector3().copy(camera.position);
    const currentCamTarget = new THREE.Vector3(0, 40, -180);

    const renderLoop = () => {
      animFrameId.current = requestAnimationFrame(renderLoop);

      const elapsedTime = clock.getElapsedTime();
      const metrics = audioEngine.getMetrics();

      if (onMetricsUpdate) {
        onMetricsUpdate(metrics);
      }

      // FPS calculation
      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        if (onFpsUpdate) {
          onFpsUpdate(Math.round((frameCount * 1000) / (now - lastFpsTime)));
        }
        frameCount = 0;
        lastFpsTime = now;
      }

      // Update Visualizer Sub-Systems
      if (horizonRef.current) {
        horizonRef.current.update(elapsedTime, metrics);
      }
      if (flockRef.current) {
        flockRef.current.update(elapsedTime, metrics);
      }
      if (plasmaRef.current) {
        plasmaRef.current.update(elapsedTime, metrics);
      }

      // Camera Choreography
      const alphaPos = flockRef.current ? flockRef.current.getAlphaPosition() : new THREE.Vector3(0, 50, -200);
      const alphaHeading = flockRef.current ? flockRef.current.getAlphaHeading() : new THREE.Vector3(0, 0, -1);

      let targetCamPos = new THREE.Vector3();
      let lookTarget = new THREE.Vector3();

      if (cameraMode === 'chase') {
        const chaseDistance = 65 + metrics.bass * 15;
        const chaseHeight = 22 + metrics.bass * 8;
        targetCamPos.copy(alphaPos)
          .sub(alphaHeading.clone().multiplyScalar(chaseDistance))
          .add(new THREE.Vector3(0, chaseHeight, 0));
        lookTarget.copy(alphaPos).add(new THREE.Vector3(0, 6, 0));
      } else if (cameraMode === 'dragon_pov') {
        targetCamPos.copy(alphaPos).add(new THREE.Vector3(0, 4, 0)).add(alphaHeading.clone().multiplyScalar(5));
        lookTarget.copy(alphaPos).add(alphaHeading.clone().multiplyScalar(120));
      } else if (cameraMode === 'orbit') {
        const radius = 160;
        const x = Math.sin(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi) * radius;
        const y = 35 + Math.sin(orbitAngles.current.phi) * radius;
        const z = -120 + Math.cos(orbitAngles.current.theta) * Math.cos(orbitAngles.current.phi) * radius;
        targetCamPos.set(x, y, z);
        lookTarget.set(0, 45, -200);
      } else {
        const swayX = Math.sin(elapsedTime * 0.15) * 35;
        const swayY = Math.cos(elapsedTime * 0.2) * 10;
        targetCamPos.set(swayX, 48 + swayY, 130);
        lookTarget.set(0, 55, -450);
      }

      const lerpSpeed = cameraMode === 'dragon_pov' ? 0.22 : 0.06;
      currentCamPos.lerp(targetCamPos, lerpSpeed);
      currentCamTarget.lerp(lookTarget, lerpSpeed);

      camera.position.copy(currentCamPos);
      camera.lookAt(currentCamTarget);

      camera.fov = 58 + (metrics.bass * 6) + (metrics.beatStrength * 4);
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
      }
      renderer.dispose();
    };
  }, [cameraMode, onFpsUpdate, onMetricsUpdate]);

  if (isWebGLError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070614] text-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4">
          <span className="text-rose-400 font-mono text-2xl font-bold">3D</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">WebGL Visualizer Paused</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Your browser paused or lost the 3D graphics context. Audio continues to stream seamlessly in background mode.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Restore 3D Engine
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none touch-none">
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
};
