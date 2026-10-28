import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Flame, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { ASL_CATALOG } from './SignGuideModal';
import { RecognitionResult } from '../types';

interface PracticeModeProps {
  isOpen: boolean;
  onClose: () => void;
  currentDetectedSign: RecognitionResult | null;
  targetSymbolOverride?: string | null;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  isOpen,
  onClose,
  currentDetectedSign,
  targetSymbolOverride,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [matchedTime, setMatchedTime] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const successTimeoutRef = useRef<number | null>(null);

  const practiceItems = ASL_CATALOG;
  const currentTarget = practiceItems[currentIndex % practiceItems.length];

  // Set target override if selected from guide
  useEffect(() => {
    if (targetSymbolOverride) {
      const idx = practiceItems.findIndex((it) => it.symbol === targetSymbolOverride);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [targetSymbolOverride, practiceItems]);

  // Check matching sign
  useEffect(() => {
    if (!isOpen || isSuccess || !currentTarget || !currentDetectedSign) {
      setMatchedTime(0);
      return;
    }

    const matches =
      currentDetectedSign.sign.toUpperCase() === currentTarget.symbol.toUpperCase() ||
      (currentTarget.symbol.includes(currentDetectedSign.sign) && currentDetectedSign.sign !== '...');

    if (matches && currentDetectedSign.confidence >= 0.75) {
      const interval = setInterval(() => {
        setMatchedTime((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            // Trigger celebration
            setIsSuccess(true);
            sounds.playWordComplete();
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
            setScore((s) => s + 10);
            setStreak((st) => st + 1);

            // Move to next after brief pause
            successTimeoutRef.current = window.setTimeout(() => {
              setCurrentIndex((idx) => (idx + 1) % practiceItems.length);
              setIsSuccess(false);
              setMatchedTime(0);
            }, 1200);

            return 1;
          }
          return prev + 0.15;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setMatchedTime(0);
    }
  }, [isOpen, isSuccess, currentTarget, currentDetectedSign, practiceItems.length]);

  useEffect(() => () => {
    if (successTimeoutRef.current !== null) {
      window.clearTimeout(successTimeoutRef.current);
    }
  }, []);

  if (!isOpen) return null;

  const nextTarget = () => {
    setIsSuccess(false);
    setMatchedTime(0);
    setCurrentIndex((prev) => (prev + 1) % practiceItems.length);
  };

  const resetStats = () => {
    setScore(0);
    setStreak(0);
    setMatchedTime(0);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Interactive Practice</h2>
              <p className="text-xs text-slate-400">Match the target sign using your camera</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gamification Stats Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 font-medium">Score:</span>
            <span className="text-white font-bold font-mono">{score} pts</span>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-slate-400 font-medium">Streak:</span>
            <span className="text-orange-400 font-bold font-mono">{streak}x</span>
          </div>

          <button
            onClick={resetStats}
            title="Reset Score"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target Sign Card */}
        <div className="p-8 flex flex-col items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
            Target Sign
          </span>

          <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/40 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/10 relative">
            <span className="text-4xl font-black text-white">{currentTarget.symbol}</span>
            {isSuccess && (
              <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl flex items-center justify-center animate-in zoom-in-75">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
            )}
          </div>

          <h3 className="text-2xl font-bold text-white mb-1">{currentTarget.name}</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
            {currentTarget.description}
          </p>

          <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-400 italic mb-6">
            💡 {currentTarget.tips}
          </div>

          {/* Real-time Match Progress Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Current: {currentDetectedSign?.sign || 'No hand detected'}</span>
              <span>{Math.round(matchedTime * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-150 rounded-full ${
                  isSuccess ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                }`}
                style={{ width: `${Math.min(matchedTime * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={nextTarget}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all ml-auto"
          >
            <span>Skip Sign</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
