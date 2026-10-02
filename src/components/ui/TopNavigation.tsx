import React from 'react';
import { Volume2, Maximize2, Minimize2, Radio, BookOpen, Activity, Layers } from 'lucide-react';
import { AudioSourceType } from '../../services/audioEngine';

interface TopNavigationProps {
  currentStation: AudioSourceType;
  onSelectStation: (type: AudioSourceType) => void;
  onOpenStorefront: () => void;
  onOpenTelemetry: () => void;
  onOpenPlaylist: () => void;
  onOpenRooms: () => void;
  activeRoomName: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  fps: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentStation,
  onSelectStation,
  onOpenStorefront,
  onOpenTelemetry,
  onOpenPlaylist,
  onOpenRooms,
  activeRoomName,
  isFullscreen,
  onToggleFullscreen,
  fps
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 px-4 md:px-8 flex items-center justify-between glass-surface border-b border-white/10 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); }}
          className="text-lg md:text-xl font-bold tracking-tight text-white font-display flex items-center gap-2 group cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="bg-gradient-to-r from-rose-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            FluidmotionTV
          </span>
          <span className="text-xs font-mono text-slate-400 font-normal hidden sm:inline">
            West Coast Radio
          </span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links / station tabs */}
      <nav className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
        <button
          onClick={() => onSelectStation('generative')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            currentStation === 'generative'
              ? 'bg-gradient-to-r from-rose-500/80 to-purple-600/80 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Generative Sunset</span>
        </button>

        <button
          onClick={onOpenRooms}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Switch between 10 3D Rooms"
        >
          <Layers className="w-3.5 h-3.5 text-rose-400" />
          <span>Room: {activeRoomName}</span>
        </button>

        <button
          onClick={onOpenPlaylist}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            currentStation === 'local_mp3'
              ? 'bg-gradient-to-r from-rose-500/80 to-purple-600/80 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>mp3s Library</span>
        </button>

        <button
          onClick={() => onSelectStation('microphone')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            currentStation === 'microphone'
              ? 'bg-gradient-to-r from-rose-500/80 to-purple-600/80 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Studio Mic</span>
        </button>

        <button
          onClick={onOpenTelemetry}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Node Telemetry</span>
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 tabular-nums">
          <span className="text-emerald-400 font-semibold">{fps}</span>
          <span>FPS</span>
        </div>

        {/* Master Edition Sovereign Storefront CTA */}
        <button
          onClick={onOpenStorefront}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 via-fuchsia-600 to-indigo-600 hover:from-rose-500 hover:via-fuchsia-500 hover:to-indigo-500 rounded-lg shadow-lg shadow-rose-950/40 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Master Edition · $9</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
