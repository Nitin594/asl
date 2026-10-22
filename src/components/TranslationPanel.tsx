import React, { useState } from 'react';
import {
  Volume2,
  Trash2,
  Delete,
  Copy,
  Check,
  Sparkles,
  Sliders,
  CornerDownLeft,
  Space,
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { getWordSuggestions } from '../utils/words';

interface TranslationPanelProps {
  currentWord: string;
  sentence: string;
  onAddSpace: () => void;
  onBackspace: () => void;
  onClear: () => void;
  onSelectSuggestion: (word: string) => void;
  ttsEnabled: boolean;
  holdDuration: number;
  onHoldDurationChange: (val: number) => void;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({
  currentWord,
  sentence,
  onAddSpace,
  onBackspace,
  onClear,
  onSelectSuggestion,
  ttsEnabled,
  holdDuration,
  onHoldDurationChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fullText = (sentence + (currentWord ? (sentence ? ' ' : '') + currentWord : '')).trim();
  const suggestions = getWordSuggestions(currentWord);

  const handleCopy = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (fullText) {
      sounds.speakText(fullText);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-6 justify-between gap-5">
      {/* Top Header & Settings Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Live Translation
          </h2>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl border text-xs transition-all flex items-center gap-1.5 ${
            showSettings
              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Settings collapsible box */}
      {showSettings && (
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Hold Sensitivity ({holdDuration}ms)</span>
            <span className="text-indigo-400 font-mono text-[11px]">
              {holdDuration < 450 ? 'Fast' : holdDuration > 700 ? 'Relaxed' : 'Balanced'}
            </span>
          </div>
          <input
            type="range"
            min={300}
            max={1000}
            step={50}
            value={holdDuration}
            onChange={(e) => onHoldDurationChange(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <p className="text-[11px] text-slate-500">
            Hold a sign steady for this duration to confirm and type each letter.
          </p>
        </div>
      )}

      {/* Main Text Display Output Area */}
      <div className="flex-1 flex flex-col justify-end bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 min-h-[160px] overflow-y-auto">
        {sentence && (
          <p className="text-slate-400 text-sm font-medium mb-2 leading-relaxed">
            {sentence}
          </p>
        )}

        {/* Current Active Word with glowing cursor */}
        <div className="flex items-center gap-1 flex-wrap">
          {currentWord ? (
            <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 tracking-wider">
              {currentWord}
            </span>
          ) : (
            <span className="text-slate-600 text-lg italic">
              {sentence ? 'Keep signing or add next word...' : 'Sign with your hand in camera view...'}
            </span>
          )}
          <span className="w-2.5 h-8 bg-indigo-500 rounded animate-pulse" />
        </div>
      </div>

      {/* Autocomplete Suggestions Chips */}
      {suggestions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Word Suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((word) => (
              <button
                key={word}
                onClick={() => onSelectSuggestion(word)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold tracking-wide transition-all shadow-sm"
              >
                + {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons (Space, Backspace, Clear, Speak, Copy) */}
      <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800">
        {/* Space */}
        <button
          onClick={onAddSpace}
          title="Add Space between words"
          className="col-span-2 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-95"
        >
          <Space className="w-4 h-4 text-indigo-400" />
          <span>Space</span>
        </button>

        {/* Backspace */}
        <button
          onClick={onBackspace}
          title="Delete last letter"
          className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center border border-slate-700 transition-all active:scale-95"
        >
          <Delete className="w-4 h-4 text-amber-400" />
        </button>

        {/* Speak */}
        <button
          onClick={handleSpeak}
          disabled={!fullText}
          title="Read out loud (TTS)"
          className={`py-3 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center border transition-all active:scale-95 ${
            fullText
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
              : 'bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Copy / Clear */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!fullText}
            title="Copy translated text"
            className="flex-1 py-3 px-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center border border-slate-700 transition-all active:scale-95"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-cyan-400" />
            )}
          </button>
          <button
            onClick={onClear}
            disabled={!fullText}
            title="Clear all text"
            className="py-3 px-2 rounded-2xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-semibold flex items-center justify-center border border-slate-700/60 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

