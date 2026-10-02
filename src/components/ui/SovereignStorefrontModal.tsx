import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Download, ExternalLink, Zap, Layers, RefreshCw, Cpu, Award } from 'lucide-react';
import { SOVEREIGN_CATALOG, SovereignBookVolume, LiveSalesTelemetryEvent } from '../../data/sovereignManifest';

interface SovereignStorefrontModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (tx: LiveSalesTelemetryEvent) => void;
}

export const SovereignStorefrontModal: React.FC<SovereignStorefrontModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted
}) => {
  const [selectedVolume, setSelectedVolume] = useState<SovereignBookVolume>(SOVEREIGN_CATALOG[0]);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'authorizing' | 'verified' | 'success'>('review');
  const [completedTx, setCompletedTx] = useState<LiveSalesTelemetryEvent | null>(null);

  // 3D Holographic Card Mouse Tilt
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ x: x * 18, y: -y * 18 });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  const handlePayPalCheckout = () => {
    setIsProcessingPayPal(true);
    setCheckoutStep('authorizing');

    // Simulate real-time PayPal Business API handshake & secure webhook verification
    setTimeout(() => {
      setCheckoutStep('verified');

      setTimeout(() => {
        const orderId = 'TX-' + Math.floor(100000 + Math.random() * 900000);
        const txHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        const newTx: LiveSalesTelemetryEvent = {
          id: orderId,
          timestamp: new Date().toISOString(),
          operatorId: `OP-CLIENT-${Math.floor(100 + Math.random() * 900)}`,
          nodeRegion: 'US-WEST (Pacific Sovereign Node)',
          volumeTitle: selectedVolume.title,
          amountUSD: selectedVolume.priceUSD,
          paymentMethod: 'PayPal Business API',
          transactionHash: txHash,
          status: 'SETTLED'
        };

        setCompletedTx(newTx);
        onOrderCompleted(newTx);
        setCheckoutStep('success');
        setIsProcessingPayPal(false);
      }, 900);
    }, 1200);
  };

  const handleResetCheckout = () => {
    setCheckoutStep('review');
    setCompletedTx(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto glass-accent rounded-3xl border border-white/15 overflow-hidden shadow-2xl shadow-rose-950/40 text-slate-100">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-base md:text-lg font-bold font-display tracking-tight text-white">
              The Fluid Motion of the Future · Sovereign Storefront
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-md hidden sm:inline">
              PAYPAL BUSINESS GATEWAY
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Selector Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto bg-black/20">
          {SOVEREIGN_CATALOG.map((vol) => (
            <button
              key={vol.id}
              onClick={() => {
                setSelectedVolume(vol);
                handleResetCheckout();
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                selectedVolume.id === vol.id
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Vol. {vol.volumeNumber}</span>
              <span className="font-normal opacity-85">({vol.priceUSD === 9 ? '$9 Master Edition' : `$${vol.priceUSD}`})</span>
              {vol.releaseStatus === 'live' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </div>

        {/* Main Storefront Body */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-h-[75vh] overflow-y-auto">
          {/* Left Column: 3D Holographic Card Display */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="relative w-64 md:w-72 aspect-[3/4] rounded-2xl p-1 bg-gradient-to-tr from-rose-500/40 via-purple-500/30 to-cyan-500/40 shadow-2xl shadow-rose-950/50 transition-transform duration-150 ease-out cursor-pointer group"
              style={{
                perspective: '1000px',
                transform: `rotateY(${cardTilt.x}deg) rotateX(${cardTilt.y}deg)`
              }}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-black border border-white/20">
                <img
                  src={selectedVolume.coverImage}
                  alt={selectedVolume.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Holographic Iridescent Glare Sheen */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
                  style={{
                    transform: `translate(${cardTilt.x * 2}px, ${cardTilt.y * 2}px)`
                  }}
                />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono text-cyan-300">
                  {selectedVolume.code}
                </div>

                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-black/85 backdrop-blur-md border border-white/10">
                  <div className="text-[11px] text-slate-300 font-medium">Single License</div>
                  <div className="text-sm font-bold text-white font-display">
                    {selectedVolume.priceUSD === 9 ? '$9.00 USD Master Edition' : `$${selectedVolume.priceUSD}.00 USD`}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 mt-3 text-center">
              Move cursor over card for 3D holographic tilt inspection
            </p>
          </div>

          {/* Right Column: Title, Specs, PayPal Checkout */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-widest font-semibold">
                <span>Volume 0{selectedVolume.volumeNumber}</span>
                <span className="text-slate-600">/</span>
                <span>{selectedVolume.releaseStatus === 'live' ? 'Instant Node Delivery' : 'In Pipeline Compilation'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display mt-1">
                {selectedVolume.title}
              </h1>
              <p className="text-sm text-cyan-300 font-medium mt-0.5">
                {selectedVolume.subtitle}
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedVolume.synopsis}
            </p>

            {/* Technical Specifications */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Master Format:</span>
                <span className="text-slate-200 font-medium">{selectedVolume.specifications.format}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Audio Companion:</span>
                <span className="text-slate-200 font-medium">{selectedVolume.specifications.audioCompanion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Security & DRM:</span>
                <span className="text-emerald-400 font-mono">{selectedVolume.specifications.smartContractVerification}</span>
              </div>
            </div>

            {/* Modules / Chapters Accordion Preview */}
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Included Manifest Modules ({selectedVolume.tableOfContents.length})
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1 text-xs text-slate-300">
                {selectedVolume.tableOfContents.map((ch, idx) => (
                  <div key={idx} className="px-2.5 py-1 rounded bg-black/30 border border-white/5 flex items-center gap-2">
                    <span className="text-rose-400 font-mono text-[10px]">#{idx + 1}</span>
                    <span>{ch}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Action Zone */}
            <div className="pt-2">
              {checkoutStep === 'review' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Immediate Settlement Total</div>
                      <div className="text-2xl font-black text-white font-display">
                        ${selectedVolume.priceUSD}.00 <span className="text-xs font-normal text-slate-400">USD</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified Node Security</span>
                    </div>
                  </div>

                  {/* PayPal Business Checkout Primary Button */}
                  <button
                    onClick={handlePayPalCheckout}
                    disabled={isProcessingPayPal}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-900 bg-[#ffc439] hover:bg-[#ffb619] shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-3 active:scale-98 cursor-pointer"
                  >
                    <span className="font-extrabold italic text-[#003087] text-lg font-serif">Pay<span className="text-[#0079c1]">Pal</span></span>
                    <span className="text-slate-900 text-sm font-semibold">
                      Checkout with PayPal (${selectedVolume.priceUSD}.00)
                    </span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center font-mono">
                    Instant PayPal Business Webhook token capture · Instant node token release
                  </p>
                </div>
              )}

              {checkoutStep === 'authorizing' && (
                <div className="p-6 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-amber-200">
                    Communicating with PayPal Business Gateway...
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Binding API order token and signing cryptographic transaction ledger
                  </p>
                </div>
              )}

              {checkoutStep === 'verified' && (
                <div className="p-6 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-center space-y-3">
                  <Cpu className="w-6 h-6 text-cyan-400 animate-pulse mx-auto" />
                  <div className="text-sm font-bold text-cyan-200">
                    Webhook Authorized: Verifying Node Settlement
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Node US-WEST confirmed payment verification. Minting license token...
                  </p>
                </div>
              )}

              {checkoutStep === 'success' && completedTx && (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-emerald-200">
                        Payment Settled & License Issued!
                      </div>
                      <div className="text-xs text-slate-300 font-mono">
                        Order #{completedTx.id} · Token {completedTx.transactionHash}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 rounded-lg text-xs font-mono text-slate-300 space-y-1">
                    <div>Status: <span className="text-emerald-400 font-bold">SETTLED</span></div>
                    <div>Gateway: PayPal Business API (Instant Webhook)</div>
                    <div>Access Rights: Full Master Codex + Lossless Audio + Shader Code</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="#download"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Accessing ${selectedVolume.title} digital package.\nTransaction Hash: ${completedTx.transactionHash}\nThank you for supporting FluidmotionTV!`);
                      }}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Digital Package</span>
                    </a>

                    <button
                      onClick={handleResetCheckout}
                      className="py-2.5 px-4 bg-white/10 hover:bg-white/15 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
