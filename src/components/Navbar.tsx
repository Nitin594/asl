import React from 'react';
import { Hand, BookOpen, Target, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface NavbarProps {
  ttsEnabled: boolean;
  onToggleTts: () => void;
  onOpenGuide: () => void;
  onOpenPractice: () => void;
  fps: number;
  modelReady: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  ttsEnabled,
  onToggleTts,
  onOpenGuide,
  onOpenPractice,
  fps,
  modelReady,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Hand className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">SignSync</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ASL Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              In-Browser Pretrained Vision & Gesture Recognition
            </p>
          </div>
        </div>

        {/* Center Status Indicators */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                modelReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 font-mono">
              {modelReady ? 'MediaPipe Ready' : 'Loading Model...'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono">{fps} FPS</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* TTS Mute / Unmute */}
          <button
            onClick={onToggleTts}
            title={ttsEnabled ? 'Mute Speech' : 'Enable Speech'}
            className={`p-2 rounded-xl transition-all border ${
              ttsEnabled
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* ASL Reference Guide */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Sign Guide</span>
          </button>

          {/* Interactive Practice Mode */}
          <button
            onClick={onOpenPractice}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/20"
          >
            <Target className="w-4 h-4 text-cyan-200" />
            <span>Practice</span>
          </button>
        </div>
      </div>
    </header>
  );
};

