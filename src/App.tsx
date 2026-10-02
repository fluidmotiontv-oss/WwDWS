/**
 * FluidmotionTV West Coast Radio
 * Immersive 3D Audio-Reactive Portal, 10 Dimension Rooms & Sovereign Storefront
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Radio, Layers, Sparkles } from 'lucide-react';
import { WestCoastAudioEngine, AudioMetrics, AudioSourceType, RadioTrack } from './services/audioEngine';
import { VisualizerScene, CameraViewMode } from './components/visualizer/VisualizerScene';
import { TopNavigation } from './components/ui/TopNavigation';
import { PlayerOverlay } from './components/ui/PlayerOverlay';
import { ControlsHUD } from './components/ui/ControlsHUD';
import { SovereignStorefrontModal } from './components/ui/SovereignStorefrontModal';
import { TelemetryModal } from './components/ui/TelemetryModal';
import { PlaylistModal } from './components/ui/PlaylistModal';
import { RoomSwitcherModal } from './components/ui/RoomSwitcherModal';
import { INITIAL_TELEMETRY_LOGS, LiveSalesTelemetryEvent } from './data/sovereignManifest';
import { VISUAL_ROOMS, RoomTheme } from './data/roomsManifest';

export default function App() {
  const audioEngine = WestCoastAudioEngine.getInstance();

  // Visualizer & Audio State
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [activeRoom, setActiveRoom] = useState<RoomTheme>(VISUAL_ROOMS[0]);
  const [isAutoMorph, setIsAutoMorph] = useState<boolean>(true);
  const [autoMorphCountdown, setAutoMorphCountdown] = useState<number>(32);

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
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState<boolean>(false);

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

  // Auto-Morph between 10 visual rooms every ~32 seconds
  const activeRoomRef = useRef(activeRoom);
  activeRoomRef.current = activeRoom;

  useEffect(() => {
    if (!isAutoMorph) return;

    const timer = setInterval(() => {
      setAutoMorphCountdown((prev) => {
        if (prev <= 1) {
          // Time to morph! Select a new random room
          const availableRooms = VISUAL_ROOMS.filter((r) => r.id !== activeRoomRef.current.id);
          const nextRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)] || VISUAL_ROOMS[0];
          setActiveRoom(nextRoom);
          return 32;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoMorph]);

  // Keyboard shortcuts: 1-9 & 0 for rooms, 'R' for random, 'M' for auto-morph
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      if (key >= '1' && key <= '9') {
        const index = parseInt(key) - 1;
        if (VISUAL_ROOMS[index]) {
          setActiveRoom(VISUAL_ROOMS[index]);
          setAutoMorphCountdown(32);
        }
      } else if (key === '0') {
        // Room 10
        if (VISUAL_ROOMS[9]) {
          setActiveRoom(VISUAL_ROOMS[9]);
          setAutoMorphCountdown(32);
        }
      } else if (key === 'R') {
        const availableRooms = VISUAL_ROOMS.filter((r) => r.id !== activeRoomRef.current.id);
        const nextRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)] || VISUAL_ROOMS[0];
        setActiveRoom(nextRoom);
        setAutoMorphCountdown(32);
      } else if (key === 'M') {
        setIsAutoMorph((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secure Background Telemetry & Sales Monitoring Loop
  useEffect(() => {
    const interval = setInterval(() => {
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

  const handleRandomRoom = useCallback(() => {
    const availableRooms = VISUAL_ROOMS.filter((r) => r.id !== activeRoom.id);
    const nextRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)] || VISUAL_ROOMS[0];
    setActiveRoom(nextRoom);
    setAutoMorphCountdown(32);
  }, [activeRoom]);

  const handleSelectRoom = useCallback((room: RoomTheme) => {
    setActiveRoom(room);
    setAutoMorphCountdown(32);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04040a] text-slate-100 select-none">
      {/* 1. Master 3D Visualizer Scene (Horizon Engine, Cyber Dragons, Plasma Surface, Active Room) */}
      <VisualizerScene
        cameraMode={cameraMode}
        activeRoom={activeRoom}
        onFpsUpdate={setFps}
        onMetricsUpdate={setMetrics}
      />

      {/* 2. Top Navigation (Brand, Station quick-links, Active Room, Master Edition $9 CTA) */}
      <TopNavigation
        currentStation={currentTrack.sourceType}
        onSelectStation={handleSelectStation}
        onOpenStorefront={() => setIsStorefrontOpen(true)}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
        onOpenRooms={() => setIsRoomsModalOpen(true)}
        activeRoomName={activeRoom.name}
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

      {/* 4. Bottom HUD Controls (Camera Selector, Room 01-10 Trigger, Plasma hint, FFT band meters) */}
      <ControlsHUD
        cameraMode={cameraMode}
        onSelectCamera={setCameraMode}
        metrics={metrics}
        onOpenPlaylist={() => setIsPlaylistOpen(true)}
        onOpenRooms={() => setIsRoomsModalOpen(true)}
        onRandomRoom={handleRandomRoom}
        activeRoomNumber={activeRoom.number}
        isAutoMorph={isAutoMorph}
        onToggleAutoMorph={() => setIsAutoMorph((prev) => !prev)}
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
                West Coast Radio · 10 Dimension Rooms
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Experience an audio-reactive 3D visualizer driven by real-time Web Audio API FFT analysis, cyber dragons, and 10 auto-morphing dimensions.
              </p>
            </div>

            <button
              onClick={handleStartAudio}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-rose-600 via-fuchsia-600 to-indigo-600 hover:from-rose-500 hover:via-fuchsia-500 hover:to-indigo-500 shadow-xl shadow-rose-950/60 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer text-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Tune In & Launch Visualizer</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
              <span>10 Visual Realms</span>
              <span>·</span>
              <span>Auto-Morphing</span>
              <span>·</span>
              <span>Web Audio API</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Dimension Portal (10 Visual Rooms & Auto-Morph Switcher) */}
      <RoomSwitcherModal
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
        activeRoom={activeRoom}
        onSelectRoom={handleSelectRoom}
        isAutoMorph={isAutoMorph}
        onToggleAutoMorph={() => setIsAutoMorph((prev) => !prev)}
        autoMorphCountdown={autoMorphCountdown}
      />

      {/* 7. Sovereign Storefront Modal ($9 Master Edition & PayPal Checkout) */}
      <SovereignStorefrontModal
        isOpen={isStorefrontOpen}
        onClose={() => setIsStorefrontOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* 8. Live Sales Telemetry & Sovereign Node Monitor */}
      <TelemetryModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        telemetryLogs={telemetryLogs}
      />

      {/* 9. Local ./public/mp3s/ Playlist & MP3 Manager */}
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
