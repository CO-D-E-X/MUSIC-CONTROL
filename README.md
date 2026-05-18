# CODEX MUSIC

CODEX MUSIC is a premium, self-hosted music player designed for audiophiles who love local collections. It features a sleek "industrial-dark" aesthetic with glassmorphism, advanced queue management, and Spotify-style gesture controls.

## ✨ Features

- **Industrial Dark UI**: A high-contrast, premium interface with indigo accents and smooth animations.
- **Gesture Controls**: Spotify-style swiping. Slide right to **Add to Queue**, slide left to **Remove**.
- **Advanced Queue**: Fully manageable queue with reordering and "Play Next" capabilities.
- **Synced Lyrics**: Supports `.lrc` files with automatic scrolling and highlighting.
- **Audio Visualizer**: Real-time frequency bar visualizer integrated into the player bar.
- **FLAC Support**: High-quality lossless audio support alongside MP3 and WAV.
- **Desktop Shell**: Runs as a native desktop application via Electron.

## 📂 Project Structure

```text
codex-music/
├── electron/               # Electron desktop shell
├── server/
│   ├── config.js           # Server configuration & paths
│   ├── index.js            # Express API (Streaming & Metadata)
│   └── library-service.js  # File scanning & metadata parsing
├── src/
│   ├── components/         # Lyrics, Visualizer, and UI components
│   ├── hooks/              # Custom useAudioPlayer hook (Logic)
│   ├── App.jsx             # Main Application Shell
│   └── main.jsx            # React Entry Point
├── my-library/             # Local music storage (.mp3, .flac, .lrc)
├── package.json            # Scripts & Dependencies
└── tailwind.config.js      # Styling Configuration
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Your Library
Drop your `.mp3`, `.wav`, or `.flac` files into the `my-library/` folder. For lyrics, add a `.lrc` file with the exact same name as the song.

### 3. Run the App
**Desktop (Arch Linux / Sandbox-friendly):**
```bash
npm run dev:arch
```

**Web Version:**
```bash
npm run dev:web
```
Access at `http://localhost:5173`

## 🛠️ Technical Overview

- **Frontend**: React 19, Tailwind CSS, Framer Motion (Gestures), Lucide Icons.
- **Backend**: Node.js, Express, Music-Metadata.
- **Desktop**: Electron with custom title bar styling.
- **Streaming**: Supports Range headers for efficient audio seeking.

---
Built with 🎵 by CODEX.
