import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HADITH_DIR = path.join(__dirname, '../public/hadith');

const FILES_TO_DOWNLOAD = [
  {
    name: 'bukhari.json',
    url: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json'
  },
  {
    name: 'muslim.json',
    url: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim.json'
  }
];

// Ensure the directory exists
if (!fs.existsSync(HADITH_DIR)) {
  fs.mkdirSync(HADITH_DIR, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${path.basename(dest)}...`);
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlink(dest, () => {});
        return resolve(downloadFile(response.headers.location, dest));
      }
      
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Successfully downloaded: ${path.basename(dest)}`);
          resolve();
        });
      } else {
        file.close();
        fs.unlink(dest, () => {}); // Delete the file async
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {}); // Delete the file async
      reject(err.message);
    });
  });
}

async function main() {
  try {
    for (const file of FILES_TO_DOWNLOAD) {
      const destPath = path.join(HADITH_DIR, file.name);
      if (!fs.existsSync(destPath)) {
        await downloadFile(file.url, destPath);
      } else {
        console.log(`${file.name} already exists. Skipping.`);
      }
    }
    console.log('All Hadith files downloaded successfully!');
  } catch (error) {
    console.error('Error downloading Hadith files:', error);
    process.exit(1);
  }
}

main();
