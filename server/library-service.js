import fs from 'fs/promises';
import path from 'path';
import * as musicMetadata from 'music-metadata';
import { CONFIG } from './config.js';
import crypto from 'crypto';

export async function ensureDirs() {
  await fs.mkdir(CONFIG.DATA_DIR, { recursive: true });
  await fs.mkdir(CONFIG.ART_CACHE_DIR, { recursive: true });
}

export async function scanLibrary() {
  await ensureDirs();
  const files = await getFiles(CONFIG.LIBRARY_PATH);
  const library = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (CONFIG.SUPPORTED_FORMATS.includes(ext)) {
      try {
        const metadata = await musicMetadata.parseFile(file);
        const id = crypto.createHash('md5').update(file).digest('hex');
        
        let artUrl = null;
        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const artPath = path.join(CONFIG.ART_CACHE_DIR, `${id}.jpg`);
          await fs.writeFile(artPath, metadata.common.picture[0].data);
          artUrl = `/api/art/${id}`;
        }

        // Check for lyrics file
        const lyricsPath = file.replace(ext, '.lrc');
        let hasLyrics = false;
        try {
          await fs.access(lyricsPath);
          hasLyrics = true;
        } catch {}

        library.push({
          id,
          path: file,
          title: metadata.common.title || path.basename(file),
          artist: metadata.common.artist || 'Unknown Artist',
          album: metadata.common.album || 'Unknown Album',
          duration: metadata.format.duration,
          artUrl,
          hasLyrics
        });
      } catch (err) {
        console.error(`Error parsing ${file}:`, err.message);
      }
    }
  }

  await fs.writeFile(CONFIG.DB_FILE, JSON.stringify(library, null, 2));
  return library;
}

export async function getPlaylists() {
  try {
    const data = await fs.readFile(CONFIG.PLAYLISTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function savePlaylists(playlists) {
  await fs.writeFile(CONFIG.PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
}

export async function getLyrics(trackId) {
  const library = await loadLibrary();
  const track = library.find(t => t.id === trackId);
  if (!track) return null;

  const ext = path.extname(track.path);
  const lyricsPath = track.path.replace(ext, '.lrc');
  try {
    return await fs.readFile(lyricsPath, 'utf-8');
  } catch {
    return null;
  }
}

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

export async function loadLibrary() {
  try {
    const data = await fs.readFile(CONFIG.DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}
