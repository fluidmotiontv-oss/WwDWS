import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Radio, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { WestCoastAudioEngine, AudioMetrics, RadioTrack } from '../../services/audioEngine';

interface PlayerOverlayProps {
  currentTrack: RadioTrack;
  isPlaying: boolean;
  volume: number;
  metrics: AudioMetrics | null;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (vol: number) => void;
}

export const PlayerOverlay: React.FC<PlayerOverlayProps> = ({
  currentTrack,
  isPlaying,
  volume,
  metrics,
  onTogglePlay,
  onNext,
  onPrev,
  onVolumeChange
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(previousVolume || 0.8);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  // Mini frequency visualizer values from raw buffer or metrics
  const barHeights = React.useMemo(() => {
    if (!metrics || !metrics.frequencyData || metrics.frequencyData.length === 0) {
      return [10, 15, 20, 15, 10, 8];
    }
    const data = metrics.frequencyData;
    return [
      Math.max(8, (data[2] / 255) * 24),
      Math.max(8, (data[8] / 255) * 24),
      Math.max(8, (data[24] / 255) * 24),
      Math.max(8, (data[48] / 255) * 24),
      Math.max(8, (data[90] / 255) * 24),
      Math.max(8, (data[160] / 255) * 24)
    ];
  }, [metrics]);

  return (
    <div className="fixed top-20 right-4 md:right-8 z-30 w-80 max-w-[calc(100vw-2rem)] transition-all select-none">
      <div className="glass-surface rounded-2xl p-4 shadow-2xl shadow-black/60 border border-white/10 backdrop-blur-xl">
        {/* Header: Track Status & Collapse Toggle */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-rose-500 animate-ping' : 'bg-slate-500'}`} />
            <span className="text-slate-200 uppercase tracking-wider text-[10px] font-semibold">
              {currentTrack.sourceType === 'generative' ? 'Generative Synth Engine' :
               currentTrack.sourceType === 'microphone' ? 'Live Microphone Feed' : 'Local mp3s Audio'}
            </span>
          </div>
          
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            title={isMinimized ? 'Expand Player' : 'Minimize Player'}
            aria-label={isMinimized ? 'Expand Player' : 'Minimize Player'}
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Track Metadata */}
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white tracking-tight truncate font-display">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          {/* Mini FFT Spectrum Visualizer */}
          <div className="flex items-end gap-1 h-6 shrink-0 px-2 py-0.5 rounded-lg bg-black/40 border border-white/5">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-t-sm transition-all duration-75"
                style={{
                  height: `${h}px`,
                  backgroundColor: i === 0 || i === 1 ? '#f43f5e' : i === 2 || i === 3 ? '#ec4899' : '#06b6d4'
                }}
              />
            ))}
          </div>
        </div>

        {/* Collapsible Controls */}
        {!isMinimized && (
          <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
            {/* Audio metrics badge info */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-rose-400">
                <Sparkles className="w-3 h-3" />
                <span>FFT Beat: {metrics?.beatDetected ? 'PULSE' : 'IDLE'}</span>
              </span>
              <span>BPM: {currentTrack.bpm || 88}</span>
            </div>

            {/* Playback Transport Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onPrev}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlay}
                className={`p-3.5 rounded-full text-white shadow-lg transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-gradient-to-r from-rose-500 to-purple-600 shadow-rose-950/60 hover:scale-105'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 hover:scale-105'
                }`}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={onNext}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleMuteToggle}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setIsMuted(val === 0);
                  onVolumeChange(val);
                }}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-500"
                aria-label="Volume slider"
              />
              <span className="text-[11px] font-mono text-slate-400 tabular-nums w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
