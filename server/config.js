import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CONFIG = {
  LIBRARY_PATH: process.env.MUSIC_LIBRARY_PATH || path.join(__dirname, '../my-library'),
  DATA_DIR: path.join(__dirname, 'data'),
  DB_FILE: path.join(__dirname, 'data/library.json'),
  PLAYLISTS_FILE: path.join(__dirname, 'data/playlists.json'),
  ART_CACHE_DIR: path.join(__dirname, 'data/art'),
  SUPPORTED_FORMATS: ['.mp3', '.wav', '.flac'],
  PORT: 3030
};
