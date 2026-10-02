import React from 'react';
import { X, Sparkles, Shuffle, Check, Eye, Compass, Layers } from 'lucide-react';
import { VISUAL_ROOMS, RoomTheme } from '../../data/roomsManifest';

interface RoomSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: RoomTheme;
  onSelectRoom: (room: RoomTheme) => void;
  isAutoMorph: boolean;
  onToggleAutoMorph: () => void;
  autoMorphCountdown: number;
}

export const RoomSwitcherModal: React.FC<RoomSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeRoom,
  onSelectRoom,
  isAutoMorph,
  onToggleAutoMorph,
  autoMorphCountdown
}) => {
  if (!isOpen) return null;

  const handleRandomRoom = () => {
    const otherRooms = VISUAL_ROOMS.filter(r => r.id !== activeRoom.id);
    const random = otherRooms[Math.floor(Math.random() * otherRooms.length)];
    if (random) onSelectRoom(random);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto glass-accent rounded-3xl border border-white/15 overflow-hidden shadow-2xl shadow-rose-950/40 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-base md:text-lg font-bold font-display tracking-tight text-white">
                Dimension Portal · 10 Visual Rooms
              </h2>
              <div className="text-[11px] font-mono text-slate-400">
                Audio-reactive 3D realms for FluidmotionTV
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-Morph Toggle */}
            <button
              onClick={onToggleAutoMorph}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoMorph
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-950/40'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Auto-Morph {isAutoMorph ? `(${autoMorphCountdown}s)` : 'OFF'}</span>
            </button>

            {/* Random Pick Button */}
            <button
              onClick={handleRandomRoom}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
              title="Jump to Random Room"
              aria-label="Random Room"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Dimension Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 10 Rooms Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5 max-h-[72vh] overflow-y-auto">
          {VISUAL_ROOMS.map((room) => {
            const isSelected = activeRoom.id === room.id;
            const p = room.palette;
            const rgb1 = `rgb(${Math.round(p.vibrant1[0] * 255)}, ${Math.round(p.vibrant1[1] * 255)}, ${Math.round(p.vibrant1[2] * 255)})`;
            const rgb2 = `rgb(${Math.round(p.vibrant2[0] * 255)}, ${Math.round(p.vibrant2[1] * 255)}, ${Math.round(p.vibrant2[2] * 255)})`;
            const rgbAccent = `rgb(${Math.round(p.accent[0] * 255)}, ${Math.round(p.accent[1] * 255)}, ${Math.round(p.accent[2] * 255)})`;

            return (
              <div
                key={room.id}
                onClick={() => {
                  onSelectRoom(room);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-rose-950/30 border-rose-500/70 shadow-lg shadow-rose-950/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Glow backdrop indicator on active */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-rose-500/10 blur-xl pointer-events-none" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                      {room.number < 10 ? `0${room.number}` : room.number}
                    </span>

                    <div>
                      <h3 className="text-sm font-bold text-white font-display group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
                        <span>{room.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        {room.subtitle}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-slate-400 shrink-0">
                    {room.category}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {room.description}
                </p>

                {/* Color Palette Swatch + Selection Status */}
                <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: rgb1 }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: rgb2 }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: rgbAccent }} />
                    <span className="text-[10px] font-mono text-slate-500 ml-1">
                      {room.geometryType.replace('_', ' ')}
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
                      Enter Realm →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/10 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div>
            Shortcuts: Keys <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">9</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">0</kbd> for instant room teleport, or <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">R</kbd> for Random Realm.
          </div>
          <div>
            10 Audio-Reactive Holographic Environments
          </div>
        </div>
      </div>
    </div>
  );
};
