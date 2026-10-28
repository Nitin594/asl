# SignSync - Real-Time ASL & Sign Language Translator Web App

A modern, ultra-low-latency real-time American Sign Language (ASL) and hand gesture translator that runs **100% in the browser** using Google MediaPipe Tasks Vision and React.

## 🚀 Features

- **In-Browser Vision AI**: Powered by Google MediaPipe Hand Landmarker, tracking 21 3D hand joints at 60 FPS without sending video feeds to any external server (zero latency & 100% private).
- **ASL Alphabet & Gestures**:
  - Recognized static ASL handshapes (`A`, `B`, `C`, `D`, `F`, `I`, `L`, `O`, `S`, `U`, `V`, `W`, `Y`)
  - Common expressive signs: *I Love You* (🤟), *Thumbs Up / Yes* (👍), *Thumbs Down / No* (👎), *Hello / Five* (🖐️), *Victory / Peace* (✌️), *OK / F* (👌).
- **Smart Word & Sentence Builder**:
  - Sign-hold sensitivity timer with radial visual progress ring.
  - Live predictive word autocomplete suggestions.
  - One-click / gesture space, backspace, and clear.
- **Voice Output (Text-to-Speech)**: Integrated Web Speech API to read aloud translated sentences.
- **Interactive Practice Mode**: Gamified trainer with real-time pose matching, confetti celebration, sound effects, and streak tracking.
- **ASL Reference Guide**: Built-in visual cheat sheet explaining hand posture mechanics.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Vision Model**: `@mediapipe/tasks-vision` (WebAssembly & WebGL/WebGPU)
- **Audio & Haptics**: Web Audio API & Web Speech API
- **Icons**: Lucide React

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser and grant webcam permissions. The hand model is downloaded on first use; an internet connection is required unless the model assets are self-hosted.
