import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use local WASM and models
env.allowLocalModels = true; 
env.allowRemoteModels = false;
env.useBrowserCache = false; // Since they are local files, no need to cache in IndexedDB
env.localModelPath = '/models/';

// Set WASM paths
env.backends.onnx.wasm.wasmPaths = '/wasm/';

let transcriber = null;
let currentModelType = 'whisper'; // 'whisper' or 'vibevoice'

// Helper function to encode Float32Array to WAV Blob
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  
  return new Blob([view], { type: 'audio/wav' });
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const { type, audioData, modelName } = event.data;

  if (type === 'load') {
    try {
      self.postMessage({ status: 'loading', message: 'جاري تحميل النموذج...' });
      
      if (['faster-whisper', 'vosk'].includes(modelName)) {
        currentModelType = modelName;
        // For Sidecar models, we just check if the sidecar is running
        try {
          const res = await fetch('http://127.0.0.1:8000/status');
          if (res.ok) {
            self.postMessage({ status: 'ready', message: `${modelName} جاهز` });
          } else {
            throw new Error('فشل الاتصال بالخادم المحلى (Sidecar)');
          }
        } catch (e) {
            // Sidecar might not be started yet or model is loading on first request
            self.postMessage({ status: 'ready', message: `${modelName} مُهيأ (يتم تحميل النموذج في الخلفية)` });
        }
        return;
      }
      
      currentModelType = 'whisper';
      // Determine model based on settings
      const model = modelName === 'whisper-small' 
        ? 'Xenova/whisper-small' 
        : (modelName === 'whisper-base' ? 'Xenova/whisper-base' : 'Xenova/whisper-tiny');

      transcriber = await pipeline('automatic-speech-recognition', model, {
        dtype: 'fp32', // Force 32-bit floats to avoid quantized model error
        device: 'wasm', // Explicitly use WASM to avoid WebGPU quantization issues
        progress_callback: (info) => {
          self.postMessage({ status: 'progress', info });
        }
      });
      self.postMessage({ status: 'ready', message: 'تم تحميل النموذج' });
    } catch (err) {
      self.postMessage({ status: 'error', error: err.message });
    }
  }

  if (type === 'transcribe') {
    if (['faster-whisper', 'vosk'].includes(currentModelType)) {
      try {
        self.postMessage({ status: 'transcribing' });
        const wavBlob = encodeWAV(audioData, 16000); // UI records at 16000Hz
        
        const formData = new FormData();
        formData.append('audio', wavBlob, 'recording.wav');
        formData.append('language', 'ar');
        formData.append('engine', currentModelType);
        
        const response = await fetch('http://127.0.0.1:8000/transcribe', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        if (data.status === 'success') {
          // data.result contains text and possibly chunks with timestamps
          self.postMessage({ status: 'complete', text: data.text });
        } else {
          throw new Error(data.message || 'خطأ في التعرف على الصوت');
        }
      } catch (err) {
        self.postMessage({ status: 'error', error: err.message });
      }
      return;
    }

    if (!transcriber) {
      self.postMessage({ status: 'error', error: 'النموذج غير محمل بعد' });
      return;
    }
    try {
      self.postMessage({ status: 'transcribing' });
      const result = await transcriber(audioData, {
        language: 'arabic',
        task: 'transcribe',
      });
      self.postMessage({ status: 'complete', text: result.text });
    } catch (err) {
      self.postMessage({ status: 'error', error: err.message });
    }
  }
});
