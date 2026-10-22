import React, { useState } from 'react';
import { X, Search, Sparkles, BookOpen } from 'lucide-react';
import { SignGuideItem } from '../types';

interface SignGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForPractice?: (symbol: string) => void;
}

export const ASL_CATALOG: SignGuideItem[] = [
  // Common Gestures
  {
    symbol: 'ILY (🤟)',
    name: 'I Love You',
    category: 'gesture',
    description: 'Thumb, Index finger, and Pinky finger fully extended upright. Middle and ring fingers curled down into palm.',
    tips: 'Iconic universal ASL sign expressing love.',
    emoji: '🤟'
  },
  {
    symbol: 'HELLO (5)',
    name: 'Hello / Open Hand',
    category: 'gesture',
    description: 'All 5 fingers fully extended and spread naturally facing forward.',
    tips: 'Also used for number 5 or Stop.',
    emoji: '🖐️'
  },
  {
    symbol: 'THUMBS UP (👍)',
    name: 'Thumbs Up / Good / Yes',
    category: 'gesture',
    description: 'Fist closed tight with thumb pointing straight up.',
    tips: 'Used for affirmative, good, or yes.',
    emoji: '👍'
  },
  {
    symbol: 'THUMBS DOWN (👎)',
    name: 'Thumbs Down / Bad / No',
    category: 'gesture',
    description: 'Fist closed tight with thumb pointing straight down.',
    tips: 'Used for negative, bad, or no.',
    emoji: '👎'
  },
  {
    symbol: 'OK (F)',
    name: 'OK / Letter F',
    category: 'gesture',
    description: 'Index fingertip touches thumb tip forming a circle. Middle, ring, and pinky extended upward.',
    tips: 'Forms the letter F in ASL alphabet.',
    emoji: '👌'
  },
  {
    symbol: 'V',
    name: 'Peace / Letter V',
    category: 'alphabet',
    description: 'Index and middle fingers extended in a V-shape. Ring, pinky, and thumb folded.',
    tips: 'Keep fingers spread apart.',
    emoji: '✌️'
  },
  {
    symbol: 'L',
    name: 'Letter L',
    category: 'alphabet',
    description: 'Thumb and index finger extended at a 90-degree right angle (forming an L). Other fingers folded.',
    tips: 'Make sure thumb is horizontal and index is vertical.',
    emoji: '👆'
  },
  {
    symbol: 'Y',
    name: 'Letter Y',
    category: 'alphabet',
    description: 'Thumb and pinky extended out sideways. Index, middle, and ring curled in.',
    tips: 'Resembles the "hang loose" or "shaka" shape.',
    emoji: '🤙'
  },
  {
    symbol: 'I',
    name: 'Letter I',
    category: 'alphabet',
    description: 'Only the pinky finger extended straight up. Thumb crossed over other folded fingers.',
    tips: 'Keep pinky straight and upright.',
    emoji: '🤏'
  },
  {
    symbol: 'W',
    name: 'Letter W',
    category: 'alphabet',
    description: 'Index, middle, and ring fingers extended upward in a W shape. Pinky and thumb curled.',
    tips: 'Represents 3 fingers up.',
    emoji: '🖐️'
  },
  {
    symbol: 'B',
    name: 'Letter B',
    category: 'alphabet',
    description: 'Four fingers (index, middle, ring, pinky) extended upright together. Thumb folded across palm.',
    tips: 'Keep four fingers straight and pressed together.',
    emoji: '✋'
  },
  {
    symbol: 'D',
    name: 'Letter D',
    category: 'alphabet',
    description: 'Index finger pointing straight up. Thumb touches the curled middle, ring, and pinky.',
    tips: 'Looks like a lowercase "d".',
    emoji: '☝️'
  },
  {
    symbol: 'C',
    name: 'Letter C',
    category: 'alphabet',
    description: 'Hand curved to form a C cup shape, with thumb below and fingers arched above.',
    tips: 'Show the profile curve to the camera.',
    emoji: '🤏'
  },
  {
    symbol: 'O',
    name: 'Letter O',
    category: 'alphabet',
    description: 'All fingertips curve to touch the thumb tip, making an "O" shape.',
    tips: 'Keep the circular hole clearly visible.',
    emoji: '⭕'
  },
  {
    symbol: 'A',
    name: 'Letter A',
    category: 'alphabet',
    description: 'Fingers curled into a fist, with thumb resting straight upright against the side of the index finger.',
    tips: 'Thumb must be alongside, not folded across the front.',
    emoji: '✊'
  },
  {
    symbol: 'S',
    name: 'Letter S',
    category: 'alphabet',
    description: 'Fist with thumb wrapped across the front of the curled fingers.',
    tips: 'Contrast with A: in S, thumb crosses over fingers.',
    emoji: '👊'
  },
  {
    symbol: 'U',
    name: 'Letter U',
    category: 'alphabet',
    description: 'Index and middle fingers extended straight up pressed tightly together.',
    tips: 'Unlike V, keep the two fingers touching.',
    emoji: '✌️'
  },
];

export const SignGuideModal: React.FC<SignGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectForPractice,
}) => {
  const [filter, setFilter] = useState<'all' | 'alphabet' | 'gesture'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredItems = ASL_CATALOG.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.symbol.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">ASL Reference Guide</h2>
              <p className="text-xs text-slate-400">
                Explore hand postures and gestures supported by the recognition engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-6 bg-slate-900/60 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-stretch sm:self-auto">
            {(['all', 'alphabet', 'gesture'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search sign, letter, tip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Catalog Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.symbol}
              className="bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all group hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji || '✋'}</span>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{item.name}</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {item.symbol}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="italic truncate pr-2">💡 {item.tips}</span>
                {onSelectForPractice && (
                  <button
                    onClick={() => {
                      onSelectForPractice(item.symbol);
                      onClose();
                    }}
                    className="text-indigo-400 font-semibold hover:text-indigo-300 whitespace-nowrap"
                  >
                    Practice →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

