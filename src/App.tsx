import React, { useState, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CameraView } from './components/CameraView';
import { TranslationPanel } from './components/TranslationPanel';
import { SignGuideModal } from './components/SignGuideModal';
import { PracticeMode } from './components/PracticeMode';
import { RecognitionResult } from './types';
import { sounds } from './utils/audio';

export const App: React.FC = () => {
  // Translation state
  const [currentWord, setCurrentWord] = useState<string>('');
  const [sentence, setSentence] = useState<string>('');
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [holdDuration, setHoldDuration] = useState<number>(500); // 500ms default

  // MediaPipe & System state
  const [fps, setFps] = useState<number>(0);
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [currentDetectedSign, setCurrentDetectedSign] = useState<RecognitionResult | null>(null);

  // Gesture stabilization / hold logic
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [holdingSign, setHoldingSign] = useState<string | null>(null);

  const holdSignRef = useRef<string | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const lastCommittedTimeRef = useRef<number>(0);

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState<boolean>(false);
  const [practiceTargetOverride, setPracticeTargetOverride] = useState<string | null>(null);

  // Commit a letter or complete sign to the word/sentence
  const commitSign = useCallback(
    (signResult: RecognitionResult) => {
      const now = performance.now();
      // Debounce minimum repeat time (700ms cooldown)
      if (now - lastCommittedTimeRef.current < 700) return;
      lastCommittedTimeRef.current = now;

      const rawSign = signResult.sign;

      // Handle gestures vs single letters
      if (rawSign.startsWith('ILY')) {
        setSentence((prev) => (prev ? prev + ' I LOVE YOU' : 'I LOVE YOU'));
        sounds.playWordComplete();
        if (ttsEnabled) sounds.speakText('I love you');
      } else if (rawSign.startsWith('HELLO')) {
        setSentence((prev) => (prev ? prev + ' HELLO' : 'HELLO'));
        sounds.playWordComplete();
        if (ttsEnabled) sounds.speakText('Hello');
      } else if (rawSign.startsWith('THUMBS UP')) {
        setSentence((prev) => (prev ? prev + ' YES' : 'YES'));
        sounds.playWordComplete();
        if (ttsEnabled) sounds.speakText('Yes');
      } else if (rawSign.startsWith('THUMBS DOWN')) {
        setSentence((prev) => (prev ? prev + ' NO' : 'NO'));
        sounds.playWordComplete();
        if (ttsEnabled) sounds.speakText('No');
      } else if (rawSign.startsWith('OK')) {
        setSentence((prev) => (prev ? prev + ' OK' : 'OK'));
        sounds.playWordComplete();
        if (ttsEnabled) sounds.speakText('OK');
      } else if (signResult.type === 'letter' && rawSign.length === 1 && rawSign !== '?') {
        // Append letter to current word
        setCurrentWord((prev) => prev + rawSign);
        sounds.playLetterCommit();
      }
    },
    [ttsEnabled]
  );

  // Handle live sign stream from CameraView
  const handleSignDetected = useCallback(
    (result: RecognitionResult) => {
      // Avoid redundant state updates when sign hasn't changed
      setCurrentDetectedSign((prev) => {
        if (prev?.sign === result.sign && Math.abs(prev.confidence - result.confidence) < 0.05) {
          return prev;
        }
        return result;
      });

      if (result.sign === '...' || result.confidence < 0.70) {
        if (holdSignRef.current !== null) {
          holdSignRef.current = null;
          holdStartTimeRef.current = null;
          setHoldingSign(null);
          setHoldProgress(0);
        }
        return;
      }

      const now = performance.now();

      if (holdSignRef.current !== result.sign) {
        // User changed gesture
        holdSignRef.current = result.sign;
        holdStartTimeRef.current = now;
        setHoldingSign(result.sign);
        setHoldProgress(0);
      } else if (holdStartTimeRef.current) {
        // Holding same gesture
        const elapsed = now - holdStartTimeRef.current;
        const progress = Math.min(elapsed / holdDuration, 1);
        setHoldProgress((prev) => (Math.abs(prev - progress) > 0.03 || progress >= 1 ? progress : prev));

        if (progress >= 1) {
          commitSign(result);
          // Reset progress after committing
          holdStartTimeRef.current = now + 400; // brief pause before re-triggering same sign
          setHoldProgress(0);
        }
      }
    },
    [holdDuration, commitSign]
  );

  // Add space between words
  const handleAddSpace = () => {
    if (currentWord) {
      if (ttsEnabled) sounds.speakText(currentWord.toLowerCase());
      sounds.playWordComplete();
      setSentence((prev) => (prev ? `${prev} ${currentWord}` : currentWord));
      setCurrentWord('');
    } else if (sentence && !sentence.endsWith(' ')) {
      setSentence((prev) => prev + ' ');
    }
  };

  // Backspace last letter
  const handleBackspace = () => {
    if (currentWord.length > 0) {
      setCurrentWord((prev) => prev.slice(0, -1));
    } else if (sentence.length > 0) {
      setSentence((prev) => prev.slice(0, -1).trimEnd());
    }
  };

  // Clear all
  const handleClear = () => {
    setCurrentWord('');
    setSentence('');
  };

  // Word suggestion selected
  const handleSelectSuggestion = (word: string) => {
    if (ttsEnabled) sounds.speakText(word.toLowerCase());
    sounds.playWordComplete();
    setSentence((prev) => (prev ? `${prev} ${word}` : word));
    setCurrentWord('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        ttsEnabled={ttsEnabled}
        onToggleTts={() => setTtsEnabled(!ttsEnabled)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenPractice={() => {
          setPracticeTargetOverride(null);
          setIsPracticeOpen(true);
        }}
        fps={fps}
        modelReady={modelReady}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          {/* Left/Main Column: Real-Time Camera with Mesh & Overlay */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[420px] sm:min-h-[500px]">
            <CameraView
              onSignDetected={handleSignDetected}
              onFpsUpdate={setFps}
              onModelLoaded={setModelReady}
              holdProgress={holdProgress}
              currentHoldingSign={holdingSign}
            />
          </div>

          {/* Right Column: Live Translation Panel */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <TranslationPanel
              currentWord={currentWord}
              sentence={sentence}
              onAddSpace={handleAddSpace}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onSelectSuggestion={handleSelectSuggestion}
              ttsEnabled={ttsEnabled}
              holdDuration={holdDuration}
              onHoldDurationChange={setHoldDuration}
            />
          </div>
        </div>

        {/* Quick Tips Footer Info */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>
              <strong className="text-slate-200">How to use:</strong> Hold your hand steady in front of the camera. The app tracks your 21 hand joints at 60 FPS and types letters into words.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
            >
              View Sign Alphabet Chart
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsPracticeOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
            >
              Start Practice Trainer
            </button>
          </div>
        </div>
      </main>

      {/* ASL Reference Catalog Modal */}
      <SignGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectForPractice={(symbol) => {
          setPracticeTargetOverride(symbol);
          setIsPracticeOpen(true);
        }}
      />

      {/* Interactive Practice Mode Modal */}
      <PracticeMode
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        currentDetectedSign={currentDetectedSign}
        targetSymbolOverride={practiceTargetOverride}
      />
    </div>
  );
};

export default App;

