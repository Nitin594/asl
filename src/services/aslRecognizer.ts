import { Landmark, RecognitionResult } from '../types';

// Distance between two 3D points
function dist(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
}

// 2D distance
function dist2D(p1: Landmark, p2: Landmark): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// Angle at b formed by (a - b - c) in degrees
function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 * mag2 === 0) return 0;
  const cos = Math.min(Math.max(dot / (mag1 * mag2), -1), 1);
  return (Math.acos(cos) * 180) / Math.PI;
}

export function classifyHandGesture(landmarks: Landmark[]): RecognitionResult {
  if (!landmarks || landmarks.length < 21) {
    return { sign: '?', confidence: 0, type: 'gesture' };
  }

  // Key joints
  const wrist = landmarks[0];
  const thumbCmc = landmarks[1];
  const thumbMcp = landmarks[2];
  const thumbIp = landmarks[3];
  const thumbTip = landmarks[4];

  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexDip = landmarks[7];
  const indexTip = landmarks[8];

  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleDip = landmarks[11];
  const middleTip = landmarks[12];

  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const ringDip = landmarks[15];
  const ringTip = landmarks[16];

  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyDip = landmarks[19];
  const pinkyTip = landmarks[20];

  // Palm scale reference: wrist to middle MCP
  const palmSize = dist(wrist, middleMcp) || 0.1;

  // Rotation-tolerant extension status for each finger:
  // A finger is extended if tip is further from wrist than PIP joint and extended from MCP
  const isIndexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.05 && dist(indexTip, indexMcp) > palmSize * 0.7;
  const isMiddleExtended = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.05 && dist(middleTip, middleMcp) > palmSize * 0.7;
  const isRingExtended = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.05 && dist(ringTip, ringMcp) > palmSize * 0.7;
  const isPinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.05 && dist(pinkyTip, pinkyMcp) > palmSize * 0.65;

  // Curled status
  const isIndexCurled = !isIndexExtended;
  const isMiddleCurled = !isMiddleExtended;
  const isRingCurled = !isRingExtended;
  const isPinkyCurled = !isPinkyExtended;

  // Thumb extended status
  const isThumbExtended = dist(thumbTip, wrist) > palmSize * 0.8 && dist(thumbTip, pinkyMcp) > palmSize * 0.8;

  // Finger tips distances relative to thumb tip
  const thumbToIndexTip = dist(thumbTip, indexTip) / palmSize;
  const indexToMiddleTip = dist(indexTip, middleTip) / palmSize;

  // 1. "I LOVE YOU" (🤟) -> Thumb, Index, Pinky extended; Middle and Ring curled
  if (isThumbExtended && isIndexExtended && isPinkyExtended && isMiddleCurled && isRingCurled) {
    return {
      sign: 'ILY (🤟)',
      confidence: 0.95,
      type: 'gesture',
      description: 'I Love You sign'
    };
  }

  // 2. "Y" -> Thumb and Pinky extended; Index, Middle, Ring curled
  if (isThumbExtended && isPinkyExtended && isIndexCurled && isMiddleCurled && isRingCurled) {
    return {
      sign: 'Y',
      confidence: 0.94,
      type: 'letter',
      description: 'Thumb & Pinky out (Letter Y)'
    };
  }

  // 3. "L" -> Thumb and Index extended at roughly 90 degrees; Middle, Ring, Pinky curled
  if (isThumbExtended && isIndexExtended && isMiddleCurled && isRingCurled && isPinkyCurled) {
    return {
      sign: 'L',
      confidence: 0.96,
      type: 'letter',
      description: 'Letter L shape'
    };
  }

  // 4. "V" / "2" / "PEACE" (✌️) -> Index and Middle extended, others curled
  if (isIndexExtended && isMiddleExtended && isRingCurled && isPinkyCurled && !isThumbExtended) {
    if (indexToMiddleTip > 0.35) {
      return {
        sign: 'V',
        confidence: 0.93,
        type: 'letter',
        description: 'Victory / Letter V'
      };
    } else {
      // "U" -> Index and Middle extended tightly together
      return {
        sign: 'U',
        confidence: 0.91,
        type: 'letter',
        description: 'Letter U (fingers together)'
      };
    }
  }

  // 5. "W" / "3" -> Index, Middle, Ring extended; Pinky and Thumb curled
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyCurled) {
    return {
      sign: 'W',
      confidence: 0.94,
      type: 'letter',
      description: 'Letter W (3 middle fingers up)'
    };
  }

  // 6. "B" / "4" -> 4 fingers extended upright, thumb tucked across palm
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && !isThumbExtended) {
    return {
      sign: 'B',
      confidence: 0.95,
      type: 'letter',
      description: 'Letter B / Four fingers up'
    };
  }

  // 7. "OPEN PALM / 5 / HELLO" (🖐️) -> All 5 fingers extended
  if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended && isThumbExtended) {
    return {
      sign: 'HELLO (5)',
      confidence: 0.97,
      type: 'gesture',
      description: 'Open hand / Hello / Number 5'
    };
  }

  // 8. "D" -> Index extended upright; Thumb touches middle, ring, pinky
  if (isIndexExtended && isMiddleCurled && isRingCurled && isPinkyCurled && !isThumbExtended) {
    return {
      sign: 'D',
      confidence: 0.92,
      type: 'letter',
      description: 'Letter D / Pointer'
    };
  }

  // 9. "I" -> Pinky extended upright; Index, Middle, Ring curled, Thumb across
  if (isPinkyExtended && isIndexCurled && isMiddleCurled && isRingCurled && !isThumbExtended) {
    return {
      sign: 'I',
      confidence: 0.93,
      type: 'letter',
      description: 'Letter I (Pinky up)'
    };
  }

  // 10. "OK" / "F" (👌) -> Index tip touching Thumb tip; Middle, Ring, Pinky extended
  if (thumbToIndexTip < 0.45 && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return {
      sign: 'OK (F)',
      confidence: 0.95,
      type: 'gesture',
      description: 'OK Sign / Letter F'
    };
  }

  // 11. "O" -> All fingers curved with tips meeting thumb tip forming an O
  const avgTipToThumb = (dist(indexTip, thumbTip) + dist(middleTip, thumbTip) + dist(ringTip, thumbTip)) / (3 * palmSize);
  if (avgTipToThumb < 0.45 && isIndexCurled && isMiddleCurled && isPinkyCurled) {
    return {
      sign: 'O',
      confidence: 0.89,
      type: 'letter',
      description: 'Letter O (circle)'
    };
  }

  // 12. "C" -> Hand curved into a C cup shape
  const thumbY = thumbTip.y;
  const indexY = indexTip.y;
  if (thumbY > indexY && Math.abs(thumbTip.x - indexTip.x) < palmSize * 0.7 && thumbToIndexTip > 0.35 && thumbToIndexTip < 0.85 && isRingCurled) {
    return {
      sign: 'C',
      confidence: 0.88,
      type: 'letter',
      description: 'Letter C'
    };
  }

  // 13. "THUMBS UP" (👍) -> Fist with thumb pointing straight up
  if (isThumbExtended && isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
    if (thumbTip.y < wrist.y - palmSize * 0.3) {
      return {
        sign: 'THUMBS UP (👍)',
        confidence: 0.96,
        type: 'gesture',
        description: 'Thumbs Up / Good / Yes'
      };
    }
    // "THUMBS DOWN" (👎)
    if (thumbTip.y > wrist.y + palmSize * 0.3) {
      return {
        sign: 'THUMBS DOWN (👎)',
        confidence: 0.95,
        type: 'gesture',
        description: 'Thumbs Down / No'
      };
    }
    // "A" -> Fist with thumb sticking upright against index side
    return {
      sign: 'A',
      confidence: 0.90,
      type: 'letter',
      description: 'Letter A (fist with thumb along side)'
    };
  }

  // 14. "S" / "CLOSED FIST" (✊) -> All fingers curled tight over thumb
  if (isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled && !isThumbExtended) {
    // Check if thumb is folded over fingers (S)
    return {
      sign: 'S',
      confidence: 0.90,
      type: 'letter',
      description: 'Letter S / Fist'
    };
  }

  return {
    sign: '...',
    confidence: 0.4,
    type: 'letter',
    description: 'Detecting hand pose...'
  };
}

