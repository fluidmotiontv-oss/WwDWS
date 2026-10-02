import React, { useState, useEffect } from 'react';
import { X, Play, Music, Upload, Folder, CheckCircle, Info, Sparkles } from 'lucide-react';
import { WestCoastAudioEngine, RadioTrack } from '../../services/audioEngine';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: RadioTrack;
  onPlayTrack: (url: string, trackInfo: Partial<RadioTrack>) => void;
  onStartGenerative: () => void;
}

interface LocalTrackMeta {
  id: string;
  filename: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  onPlayTrack,
  onStartGenerative
}) => {
  const [manifestTracks, setManifestTracks] = useState<LocalTrackMeta[]>([]);
  const [customFiles, setCustomFiles] = useState<Array<{ name: string; url: string }>>([]);

  useEffect(() => {
    // Try loading manifest from /public/mp3s/manifest.json first, then fallback to /live_MP3s/manifest.json
    fetch('./mp3s/manifest.json')
      .then(res => {
        if (!res.ok) throw new Error('mp3s manifest not found');
        return res.json();
      })
      .then(data => {
        if (data && data.tracks) {
          setManifestTracks(data.tracks);
        }
      })
      .catch(() => {
        return fetch('./live_MP3s/manifest.json')
          .then(res => res.json())
          .then(data => {
            if (data && data.tracks) {
              setManifestTracks(data.tracks);
            }
          });
      })
      .catch(() => {
        // Fallback default tracks
        setManifestTracks([
          {
            id: 'pacific-glow-01',
            filename: 'pacific_sunset_drift.mp3',
            title: 'Pacific Sunset Drift',
            artist: 'FluidmotionTV',
            genre: 'West Coast Synthwave',
            bpm: 86
          },
          {
            id: 'neon-tides-02',
            filename: 'neon_ocean_highway.mp3',
            title: 'Neon Ocean Highway',
            artist: 'Fluidmotion Collective',
            genre: 'Chillwave / Lo-Fi',
            bpm: 92
          },
          {
            id: 'dragon-flight-03',
            filename: 'luminescent_flight.mp3',
            title: 'Luminescent Flight of the Dragon',
            artist: 'FluidmotionTV x Kinetix',
            genre: 'Cybernetic Ambient',
            bpm: 110
          },
          {
            id: 'venice-vibes-04',
            filename: 'venice_golden_hour.mp3',
            title: 'Venice Golden Hour',
            artist: 'FluidmotionTV',
            genre: 'Future Funk / Groove',
            bpm: 98
          }
        ]);
      });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const objectUrl = URL.createObjectURL(file);
    const trackName = file.name.replace(/\.[^/.]+$/, "");

    setCustomFiles(prev => [...prev, { name: trackName, url: objectUrl }]);
    onPlayTrack(objectUrl, {
      title: trackName,
      artist: "Local Upload",
      genre: "User MP3",
      sourceType: "local_mp3"
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto glass-surface rounded-3xl border border-white/15 overflow-hidden shadow-2xl shadow-rose-950/40 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <Folder className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-base md:text-lg font-bold font-display tracking-tight text-white">
                ./public/mp3s/ Audio Library
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Direct Web Audio API FFT stream routing
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Playlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="p-4 bg-rose-950/20 border-b border-rose-500/20 text-xs text-rose-200/90 flex items-start gap-3">
          <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">How this directory operates: </span>
            Drop any <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-rose-300">.mp3</code> files into the local <code className="font-mono bg-black/40 px-1 py-0.5 rounded text-rose-300">./public/mp3s/</code> folder of this project. You can also pick/upload any MP3 below for immediate playback and real-time 3D FFT audio analysis!
          </div>
        </div>

        {/* Directory Track List */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Queued MP3 Directory Files
            </div>

            <div className="space-y-2">
              {manifestTracks.map((trk) => {
                const isSelected = currentTrack.title === trk.title;
                return (
                  <div
                    key={trk.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-400'
                      }`}>
                        <Music className="w-4 h-4" />
                      </div>

                      <div className="truncate">
                        <div className="text-sm font-semibold text-white truncate font-display">
                          {trk.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          ./public/mp3s/{trk.filename} · {trk.genre}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onPlayTrack(`./mp3s/${trk.filename}`, {
                          id: trk.id,
                          title: trk.title,
                          artist: trk.artist,
                          bpm: trk.bpm,
                          genre: trk.genre,
                          sourceType: 'local_mp3'
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isSelected ? 'Replay' : 'Play'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Uploaded Tracks */}
          {customFiles.length > 0 && (
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                Loaded Session MP3s
              </div>
              <div className="space-y-2">
                {customFiles.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs text-slate-200 truncate">{f.name}</span>
                    <button
                      onClick={() => {
                        onPlayTrack(f.url, {
                          title: f.name,
                          artist: "Local Upload",
                          sourceType: "local_mp3"
                        });
                        onClose();
                      }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Play
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Upload Dropzone */}
          <div className="pt-2">
            <label className="p-4 border-2 border-dashed border-white/20 hover:border-rose-400/60 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
              <Upload className="w-6 h-6 text-rose-400" />
              <div className="text-xs font-semibold text-white">
                Load Additional MP3 File From Device
              </div>
              <div className="text-[11px] text-slate-400">
                Directly feeds AnalyserNode to drive Horizon & Dragons in real time
              </div>
              <input
                type="file"
                accept="audio/mp3,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Switch to Generative Engine Button */}
          <div className="pt-1 flex items-center justify-between border-t border-white/10">
            <div className="text-xs text-slate-400">
              Prefer built-in West Coast generative synth?
            </div>
            <button
              onClick={() => {
                onStartGenerative();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Switch to Generative FM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
