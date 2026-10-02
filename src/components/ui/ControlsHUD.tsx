import React from 'react';
import { Video, Compass, Eye, Move3d, Sparkles, Music, Layers, Shuffle } from 'lucide-react';
import { CameraViewMode } from '../visualizer/VisualizerScene';
import { AudioMetrics } from '../../services/audioEngine';

interface ControlsHUDProps {
  cameraMode: CameraViewMode;
  onSelectCamera: (mode: CameraViewMode) => void;
  metrics: AudioMetrics | null;
  onOpenPlaylist: () => void;
  onOpenRooms: () => void;
  onRandomRoom: () => void;
  activeRoomNumber: number;
  isAutoMorph: boolean;
  onToggleAutoMorph: () => void;
}

export const ControlsHUD: React.FC<ControlsHUDProps> = ({
  cameraMode,
  onSelectCamera,
  metrics,
  onOpenPlaylist,
  onOpenRooms,
  onRandomRoom,
  activeRoomNumber,
  isAutoMorph,
  onToggleAutoMorph
}) => {
  const modes: Array<{ id: CameraViewMode; label: string; icon: React.ReactNode }> = [
    { id: 'chase', label: 'Chase Cam', icon: <Video className="w-3.5 h-3.5" /> },
    { id: 'horizon', label: 'Horizon Vista', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'dragon_pov', label: 'Dragon Flight', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'orbit', label: 'Free Orbit', icon: <Move3d className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="fixed bottom-4 left-4 md:left-8 z-30 flex flex-col gap-2 max-w-[calc(100vw-2rem)] select-none">
      {/* Interactive Plasma Hint */}
      <div className="glass-surface-subtle px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-slate-300 flex items-center justify-between gap-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
          <span>Interact on canvas to ripple ionized plasma waves</span>
        </div>

        {/* Quick auto-morph status indicator */}
        <button
          onClick={onToggleAutoMorph}
          className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer transition-colors ${
            isAutoMorph ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
          }`}
          title="Toggle Auto-Morph between 10 rooms"
        >
          {isAutoMorph ? 'MORPH: ON' : 'MORPH: OFF'}
        </button>
      </div>

      <div className="glass-surface rounded-xl p-2.5 flex flex-wrap items-center gap-2 border border-white/10 shadow-xl backdrop-blur-xl">
        {/* Dimension Rooms Trigger */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenRooms}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-500/40 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Browse all 10 visual rooms"
          >
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Room {activeRoomNumber < 10 ? `0${activeRoomNumber}` : activeRoomNumber}</span>
          </button>

          <button
            onClick={onRandomRoom}
            className="p-1.5 rounded-md text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Jump to Random Room"
            aria-label="Random Room"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

        {/* Camera Selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectCamera(m.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                cameraMode === m.id
                  ? 'bg-rose-500/80 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={m.label}
              aria-label={m.label}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Live Audio Bands Meter */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-black/40 rounded-lg border border-white/5 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400">BASS</span>
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-75"
                style={{ width: `${Math.min(100, (metrics?.bass || 0) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-fuchsia-400">MID</span>
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-fuchsia-500 transition-all duration-75"
                style={{ width: `${Math.min(100, (metrics?.mid || 0) * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">TREBLE</span>
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${Math.min(100, (metrics?.treble || 0) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Open mp3s Library shortcut */}
        <button
          onClick={onOpenPlaylist}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
        >
          <Music className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">MP3 Library</span>
        </button>
      </div>
    </div>
  );
};
