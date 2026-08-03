import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dest = path.join(__dirname, '../public/quran/quran.json');

async function download() {
  console.log('Downloading Quran JSON...');
  try {
    const res = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    fs.writeFileSync(dest, JSON.stringify(json));
    console.log('Quran downloaded successfully to src/quran/quran.json');
  } catch (error) {
    console.error('Error downloading Quran:', error);
  }
}

download();
