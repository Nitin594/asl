export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface RecognitionResult {
  sign: string;
  confidence: number;
  type: 'letter' | 'gesture' | 'number';
  description?: string;
  handedness?: 'Left' | 'Right';
}

export interface SignGuideItem {
  symbol: string;
  name: string;
  category: 'alphabet' | 'number' | 'gesture';
  description: string;
  tips: string;
  emoji?: string;
}

