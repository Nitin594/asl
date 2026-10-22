import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Landmark } from '../types';

// Hand landmark connection pairs for drawing skeletal overlay
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [9, 10], [10, 11], [11, 12],
  // Ring finger
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base knuckles
  [5, 9], [9, 13], [13, 17]
];

class MediaPipeVisionService {
  private handLandmarker: HandLandmarker | null = null;
  private isInitializing = false;

  async init(): Promise<HandLandmarker> {
    if (this.handLandmarker) return this.handLandmarker;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.handLandmarker) return this.handLandmarker;
    }

    this.isInitializing = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      return this.handLandmarker;
    } finally {
      this.isInitializing = false;
    }
  }

  detectForVideo(videoElement: HTMLVideoElement, timestamp: number) {
    if (!this.handLandmarker) return null;
    return this.handLandmarker.detectForVideo(videoElement, timestamp);
  }

  // Draw cyber-neon hand landmarks on HTML canvas
  drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    width: number,
    height: number,
    isMirrored = true
  ) {
    ctx.save();
    
    // Connect skeleton joints
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];
      if (!p1 || !p2) return;

      const x1 = isMirrored ? (1 - p1.x) * width : p1.x * width;
      const y1 = p1.y * height;
      const x2 = isMirrored ? (1 - p2.x) * width : p2.x * width;
      const y2 = p2.y * height;

      // Gradient line from indigo to cyan
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, '#6366f1'); // Indigo
      grad.addColorStop(1, '#06b6d4'); // Cyan

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw landmark joint points
    landmarks.forEach((p, idx) => {
      const x = isMirrored ? (1 - p.x) * width : p.x * width;
      const y = p.y * height;

      const isTip = [4, 8, 12, 16, 20].includes(idx);
      const isWrist = idx === 0;

      ctx.beginPath();
      ctx.arc(x, y, isTip ? 6 : isWrist ? 7 : 4, 0, 2 * Math.PI);

      if (isTip) {
        ctx.fillStyle = '#f43f5e'; // Rose tip
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
      } else if (isWrist) {
        ctx.fillStyle = '#ec4899'; // Pink wrist
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = '#38bdf8'; // Sky blue joint
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 4;
      }

      ctx.fill();
      ctx.shadowBlur = 0; // reset
    });

    ctx.restore();
  }
}

export const mediaPipeService = new MediaPipeVisionService();

