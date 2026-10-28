import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Sparkles, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { mediaPipeService } from '../services/mediaPipeService';
import { classifyHandGesture } from '../services/aslRecognizer';
import { RecognitionResult } from '../types';

interface CameraViewProps {
  onSignDetected: (result: RecognitionResult) => void;
  onFpsUpdate: (fps: number) => void;
  onModelLoaded: (ready: boolean) => void;
  holdProgress: number; // 0 to 1
  currentHoldingSign: string | null;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onSignDetected,
  onFpsUpdate,
  onModelLoaded,
  holdProgress,
  currentHoldingSign,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [activeSign, setActiveSign] = useState<RecognitionResult | null>(null);

  // FPS tracking
  const frameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(performance.now());

  // Initialize MediaPipe model
  useEffect(() => {
    let isMounted = true;
    mediaPipeService
      .init()
      .then(() => {
        if (isMounted) onModelLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to initialize MediaPipe:', err);
        if (isMounted) {
          setErrorMessage('Failed to load MediaPipe model. Please check internet connection.');
          onModelLoaded(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onModelLoaded]);

  // Start webcam stream
  const startCamera = useCallback(async () => {
    try {
      setErrorMessage(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
        };
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const msg =
        err instanceof DOMException && err.name === 'NotFoundError'
          ? 'No camera was found. Connect a camera and try again.'
          : err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Camera permission was denied. Allow camera access and try again.'
            : err instanceof Error
              ? err.message
              : 'Camera permission denied or camera not found.';
      setErrorMessage(msg);
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Main Detection & Render Loop
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState >= 2) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Match canvas dimensions to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const width = canvas.width;
        const height = canvas.height;

        // Draw camera frame mirrored for natural webcam interaction
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -width, 0, width, height);
        ctx.restore();

        // Perform landmark detection
        const now = performance.now();
        const results = mediaPipeService.detectForVideo(video, now);

        if (results && results.landmarks && results.landmarks.length > 0) {
          const firstHandLandmarks = results.landmarks[0];

          // Draw skeleton overlay if toggled
          if (showLandmarks) {
            mediaPipeService.drawLandmarks(ctx, firstHandLandmarks, width, height, true);
          }

          // Classify gesture
          const recognition = classifyHandGesture(firstHandLandmarks);
          if (results.handednesses && results.handednesses[0]?.[0]?.categoryName) {
            recognition.handedness = results.handednesses[0][0].categoryName as 'Left' | 'Right';
          }

          setActiveSign(recognition);
          onSignDetected(recognition);
        } else {
          setActiveSign(null);
          onSignDetected({ sign: '...', confidence: 0, type: 'gesture' });
        }

        // FPS calculation
        frameCountRef.current++;
        if (now - lastFpsTimeRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
          onFpsUpdate(fps);
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  }, [showLandmarks, onSignDetected, onFpsUpdate]);

  useEffect(() => {
    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, renderLoop]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl shadow-indigo-950/20">
      {/* Hidden source video */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      {/* Main Display Canvas */}
      <div className="relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {isCameraActive ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <CameraOff className="w-16 h-16 text-slate-600 mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold text-slate-300">Camera is Paused</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Click the turn on camera button below to resume real-time sign detection.
            </p>
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all"
            >
              Resume Camera
            </button>
          </div>
        )}

        {/* Live Detected Gesture Overlay Badge */}
        {isCameraActive && activeSign && activeSign.sign !== '...' && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-indigo-500/30 shadow-xl">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50">
              <span className="text-2xl font-black text-white">{activeSign.sign}</span>
              {/* Circular Hold Progress */}
              {holdProgress > 0 && currentHoldingSign === activeSign.sign && (
                <svg className="absolute -inset-1 w-14 h-14 -rotate-90 pointer-events-none">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray="150"
                    strokeDashoffset={150 - 150 * holdProgress}
                    className="transition-all duration-75"
                  />
                </svg>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
                  {activeSign.type}
                </span>
                <span className="text-[11px] text-slate-400">
                  {Math.round(activeSign.confidence * 100)}% match
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-[160px]">
                {activeSign.description || 'Recognized Sign'}
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="absolute top-4 right-4 max-w-md bg-red-950/90 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl backdrop-blur-md shadow-xl">
            <p className="font-semibold">Notice:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        )}

        {/* Quick Floating Camera Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
          {/* Toggle Camera */}
          <button
            onClick={isCameraActive ? stopCamera : startCamera}
            title={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
            className={`p-2 rounded-xl transition-all ${
              isCameraActive
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-red-600/30 text-red-400 hover:bg-red-600/40 border border-red-500/40'
            }`}
          >
            {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>

          {/* Toggle Landmark Mesh Overlay */}
          <button
            onClick={() => setShowLandmarks(!showLandmarks)}
            title={showLandmarks ? 'Hide landmark mesh' : 'Show landmark mesh'}
            className={`p-2 rounded-xl transition-all ${
              showLandmarks
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showLandmarks ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Switch Camera (User / Environment) */}
          <button
            onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
            title="Flip camera"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
