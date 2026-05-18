import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config.js';
import { loadLibrary, scanLibrary, ensureDirs, getPlaylists, savePlaylists, getLyrics } from './library-service.js';

const app = express();
app.use(cors());
app.use(express.json());

// Ensure directories exist on start
ensureDirs();

app.get('/api/library', async (req, res) => {
  const library = await loadLibrary();
  res.json(library);
});

app.post('/api/library/rescan', async (req, res) => {
  const library = await scanLibrary();
  res.json({ message: 'Scan complete', count: library.length });
});

app.get('/api/playlists', async (req, res) => {
  const playlists = await getPlaylists();
  res.json(playlists);
});

app.post('/api/playlists', async (req, res) => {
  await savePlaylists(req.body);
  res.json({ message: 'Playlists saved' });
});

app.get('/api/lyrics/:id', async (req, res) => {
  const lyrics = await getLyrics(req.params.id);
  if (lyrics) {
    res.json({ lyrics });
  } else {
    res.status(404).json({ message: 'Lyrics not found' });
  }
});

app.get('/api/art/:id', (req, res) => {
  const artPath = path.join(CONFIG.ART_CACHE_DIR, `${req.params.id}.jpg`);
  if (fs.existsSync(artPath)) {
    res.sendFile(artPath);
  } else {
    res.status(404).send('Not found');
  }
});

app.get('/api/stream/:id', async (req, res) => {
  const library = await loadLibrary();
  const track = library.find(t => t.id === req.params.id);
  
  if (!track) return res.status(404).send('Track not found');

  const filePath = track.path;
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(CONFIG.PORT, () => {
  console.log(`Server running at http://localhost:${CONFIG.PORT}`);
});
