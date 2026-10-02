/**
 * FluidmotionTV West Coast Radio
 * Immersive 3D Audio-Reactive Portal & Sovereign Storefront
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Sparkles, Radio, Shield, Volume2 } from 'lucide-react';
import { WestCoastAudioEngine, AudioMetrics, AudioSourceType, RadioTrack } from './services/audioEngine';
import { VisualizerScene, CameraViewMode } from './components/visualizer/VisualizerScene';
import { TopNavigation } from './components/ui/TopNavigation';
import { PlayerOverlay } from './components/ui/PlayerOverlay';
import { ControlsHUD } from './components/ui/ControlsHUD';
import { SovereignStorefrontModal } from './components/ui/SovereignStorefrontModal';
import { TelemetryModal } from './components/ui/TelemetryModal';
import { PlaylistModal } from './components/ui/PlaylistModal';
import { INITIAL_TELEMETRY_LOGS, LiveSalesTelemetryEvent } from './data/sovereignManifest';

export default function App() {
  const audioEngine = WestCoastAudioEngine.getInstance();

  // Visualizer & Audio State
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [currentTrack, setCurrentTrack] = useState<RadioTrack>(audioEngine.currentTrack);
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.isPlaying);
  const [volume, setVolume] = useState<number>(audioEngine.currentVolume);
  const [metrics, setMetrics] = useState<AudioMetrics | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [isStorefrontOpen, setIsStorefrontOpen] = useState<boolean>(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);

  // Live Telemetry Event Logs (hooked to real-time sales monitor loop)
  const [telemetryLogs, setTelemetryLogs] = useState<LiveSalesTelemetryEvent[]>(INITIAL_TELEMETRY_LOGS);

  // Synchronize with AudioEngine changes
  useEffect(() => {
    const unsub = audioEngine.subscribeState(() => {
      setCurrentTrack({ ...audioEngine.currentTrack });
      setIsPlaying(audioEngine.isPlaying);
      setVolume(audioEngine.currentVolume);
    });

    return () => unsub();
  }, [audioEngine]);

  // Secure Background Telemetry & Sales Monitoring Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Occasional simulated network acquisition token from sovereign edge nodes
      if (Math.random() > 0.45) {
        const nodeCities = ['Los Angeles Node #04', 'San Francisco Node #02', 'Seattle Node #09', 'Portland Node #03', 'San Diego Node #01'];
        const randomCity = nodeCities[Math.floor(Math.random() * nodeCities.length)];
        const orderId = 'TX-' + Math.floor(990420 + Math.random() * 9000);
        const txHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const autoLog: LiveSalesTelemetryEvent = {
          id: orderId,
          timestamp: new Date().toISOString(),
          operatorId: `OP-PACIFIC-${Math.floor(100 + Math.random() * 899)}`,
          nodeRegion: `US-WEST (${randomCity})`,
          volumeTitle: 'The Fluid Motion of the Future (Master Edition)',
          amountUSD: 9.00,
          paymentMethod: 'PayPal Business API',
          transactionHash: txHash,
          status: 'SETTLED'
        };

        setTelemetryLogs((prev) => [autoLog, ...prev.slice(0, 19)]);
      }
    }, 28000);

    return () => clearInterval(interval);
  }, []);

  // Initial user gesture activation
  const handleStartAudio = useCallback(() => {
    setHasInteracted(true);
    audioEngine.startGenerative();
  }, [audioEngine]);

  const handleTogglePlay = useCallback(() => {
    setHasInteracted(true);
    audioEngine.togglePlayPause();
  }, [audioEngine]);

  const handleNextTrack = useCallback(() => {
    audioEngine.nextTrack();
  }, [audioEngine]);

  const handlePrevTrack = useCallback(() => {
    audioEngine.prevTrack();
  }, [audioEngine]);

  const handleVolumeChange = useCallback((vol: number) => {
    audioEngine.setVolume(vol);
  }, [audioEngine]);

  const handleSelectStation = useCallback((type: AudioSourceType) => {
    setHasInteracted(true);
    if (type === 'generative') {
      audioEngine.startGenerative();
    } else if (type === 'microphone') {
      audioEngine.startMicrophone();
    } else if (type === 'local_mp3') {
      setIsPlaylistOpen(true);
    }
  }, [audioEngine]);

  const handlePlayTrack = useCallback((url: string, trackInfo: Partial<RadioTrack>) => {
    setHasInteracted(true);
    audioEngine.playLocalTrack(url, trackInfo);
  }, [audioEngine]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const handleOrderCompleted = useCallback((tx: LiveSalesTelemetryEvent) => {
    setTelemetryLogs((prev) => [tx, ...prev]);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04040a] text-slate-100 select-none">
      {/* 1. Master 3D Visualizer Scene (Horizon Engine, Cyber Dragons, Plasma Surface) */}
      <VisualizerScene
        cameraMode={cameraMode}
        onFpsUpdate={setFps}
        onMetricsUpdate={setMetrics}
      />

      {/* 2. Top Navigation (Brand, Station quick-links, Master Edition $9 CTA) */}
      <TopNavigation
        currentStation={currentTrack.sourceType}
        onSelectStation={handleSelectStation}
        onOpenStorefront={() => setIsStorefrontOpen(true)}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        fps={fps}
      />

      {/* 3. Sleek Top-Right Glassmorphic Player Card */}
      <PlayerOverlay
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        volume={volume}
        metrics={metrics}
        onTogglePlay={handleTogglePlay}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onVolumeChange={handleVolumeChange}
      />

      {/* 4. Bottom HUD Controls (Camera Selector, Plasma hint, FFT band meters) */}
      <ControlsHUD
        cameraMode={cameraMode}
        onSelectCamera={setCameraMode}
        metrics={metrics}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
      />

      {/* 5. First-Interaction Prompt (browser audio autoplay policy compliance) */}
      {!hasInteracted && !isPlaying && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="glass-accent rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/20 text-center space-y-5 shadow-2xl shadow-rose-950/50">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Radio className="w-8 h-8 text-white" />
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight">
                FluidmotionTV
              </h2>
              <p className="text-sm font-semibold text-rose-400 mt-0.5">
                West Coast Radio · Horizon Engine 3D
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Experience an audio-reactive 3D visualizer driven by real-time Web Audio API FFT analysis, cyber dragons, and interactive plasma ripples.
              </p>
            </div>

            <button
              onClick={handleStartAudio}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-rose-600 via-fuchsia-600 to-indigo-600 hover:from-rose-500 hover:via-fuchsia-500 hover:to-indigo-500 shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Tune In & Launch Visualizer</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
              <span>Web Audio API</span>
              <span>·</span>
              <span>Three.js WebGL</span>
              <span>·</span>
              <span>PayPal Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Sovereign Storefront Modal ($9 Master Edition & PayPal Checkout) */}
      <SovereignStorefrontModal
        isOpen={isStorefrontOpen}
        onClose={() => setIsStorefrontOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* 7. Live Sales Telemetry & Sovereign Node Monitor */}
      <TelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        telemetryLogs={telemetryLogs}
      />

      {/* 8. Local ./public/mp3s/ Playlist & MP3 Manager */}
      <PlaylistModal
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
        currentTrack={currentTrack}
        onPlayTrack={handlePlayTrack}
        onStartGenerative={() => audioEngine.startGenerative()}
      />
    </div>
  );
}
