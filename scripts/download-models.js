import fs from 'fs';
import path from 'path';
import { pipeline, env } from '@huggingface/transformers';

const PUBLIC_DIR = path.resolve('./public');
const WASM_DIR = path.join(PUBLIC_DIR, 'wasm');
const MODELS_DIR = path.join(PUBLIC_DIR, 'models');

// 1. Copy WASM files
console.log('Copying ONNX WASM files...');
if (!fs.existsSync(WASM_DIR)) {
  fs.mkdirSync(WASM_DIR, { recursive: true });
}

const onnxDistDir = path.resolve('./node_modules/onnxruntime-web/dist');
if (fs.existsSync(onnxDistDir)) {
  const files = fs.readdirSync(onnxDistDir);
  files.forEach(file => {
    if (file.endsWith('.wasm')) {
      fs.copyFileSync(path.join(onnxDistDir, file), path.join(WASM_DIR, file));
      console.log(`Copied: ${file}`);
    }
  });
} else {
  console.error('Could not find onnxruntime-web dist directory!');
}

// 2. Download Models
console.log('\nDownloading Whisper models (this may take a while)...');
// Configure transformers to download models to our public/models directory
env.cacheDir = MODELS_DIR;
// Disable local models for the downloading phase so it fetches from huggingface
env.allowLocalModels = false; 

async function downloadModels() {
  const models = ['Xenova/whisper-base']; // Better for Arabic than tiny
  
  for (const model of models) {
    console.log(`\nDownloading ${model}...`);
    try {
      // Initialize the pipeline just to force the download
      await pipeline('automatic-speech-recognition', model, {
        dtype: 'fp32',
        progress_callback: (info) => {
          if (info.status === 'progress') {
            process.stdout.write(`\rDownloading ${info.file}: ${Math.round(info.progress)}%`);
          } else if (info.status === 'done') {
            console.log(`\nFinished downloading ${info.file}`);
          }
        }
      });
      console.log(`\nSuccessfully downloaded ${model}`);
    } catch (err) {
      console.error(`\nError downloading ${model}:`, err);
    }
  }
}

downloadModels().then(() => {
  console.log('\nAll setup complete! Models and WASM files are now local.');
});
