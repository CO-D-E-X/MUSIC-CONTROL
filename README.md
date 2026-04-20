# CODEX MUSIC

CODEX MUSIC is a self-hosted Spotify-style desktop player for a local music folder. It scans `./my-library` by default, extracts track metadata with `music-metadata`, builds a JSON index, and serves a React/Tailwind player UI inside an Electron desktop shell with streaming playback.

## File Structure

```text
codex-music/
├── electron/               # Electron desktop shell and icon assets
├── my-library/             # Put MP3/WAV files here
├── server/
│   ├── data/               # Generated JSON index and extracted artwork cache
│   ├── config.js           # Paths, supported formats, runtime config
│   ├── index.js            # Express API and static hosting
│   ├── library-service.js  # Scanning, metadata parsing, JSON database logic
│   └── scan-cli.js         # Manual rescan entry point
├── src/
│   ├── components/         # Sidebar, search, album grid, track list, player bar
│   ├── hooks/              # Audio player state hook
│   ├── App.jsx             # Main app shell and data flow
│   ├── index.css           # Tailwind and glassmorphism styling
│   └── main.jsx            # React bootstrap
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Add music files to `./my-library` or point to another folder:

```bash
MUSIC_LIBRARY_PATH="/absolute/path/to/Music" npm run dev
```

3. Start the desktop app in development:

```bash
npm run dev
```

This opens the Electron app window.

Useful scripts:

```bash
npm run dev:web     # browser + API dev mode
npm run desktop     # production-style Electron run
```

## API Overview

- `GET /api/library` returns indexed tracks and library stats.
- `POST /api/library/rescan` rescans the configured music folder.
- `GET /api/stream/:trackId` streams audio with range support.
- `GET /api/art/:trackId` returns album artwork for the track when available.

## Notes

- Supported formats in this scaffold: `mp3`, `wav`.
- The generated JSON database is written to `server/data/library.json`.
- The UI keeps playback state at the application root, so music continues while searching or switching views.
- The Electron desktop window uses the custom `CODEX MUSIC` icon in `electron/assets/`.
