from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
import json
import logging
import wave

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow CORS for Tauri
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances
whisper_model = None
vosk_model = None

import sys

# Determine if we are running in a PyInstaller bundle
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    base_dir = sys._MEIPASS
else:
    # Running as normal python script
    base_dir = os.path.dirname(os.path.abspath(__file__))

MODELS_DIR = os.path.join(base_dir, "models")
VOSK_MODEL_PATH = os.path.join(MODELS_DIR, "vosk-model-ar-0.22-linto-1.1.0")

def load_faster_whisper():
    global whisper_model
    if whisper_model is None:
        logger.info("Loading Faster-Whisper base model...")
        try:
            from faster_whisper import WhisperModel
            import torch
            # Use GPU if available
            device = "cuda" if torch.cuda.is_available() else "cpu"
            compute_type = "float16" if device == "cuda" else "int8"
            
            whisper_model = WhisperModel("base", device=device, compute_type=compute_type, download_root=MODELS_DIR)
            logger.info("Faster-Whisper loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Faster-Whisper: {e}")
            raise e

def load_vosk():
    global vosk_model
    if vosk_model is None:
        logger.info("Loading Vosk Arabic model...")
        try:
            from vosk import Model
            if not os.path.exists(VOSK_MODEL_PATH):
                logger.error(f"Vosk model not found at {VOSK_MODEL_PATH}. Please download it.")
                raise Exception("Vosk model not found")
            vosk_model = Model(VOSK_MODEL_PATH)
            logger.info("Vosk loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Vosk: {e}")
            raise e

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), language: str = Form("ar"), engine: str = Form("faster-whisper")):
    try:
        # Save uploaded audio to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(await audio.read())
            tmp_path = tmp.name
            
        logger.info(f"Transcribing audio file using engine: {engine}")
        
        result_text = ""
        words = []

        if engine == "faster-whisper":
            load_faster_whisper()
            segments, info = whisper_model.transcribe(tmp_path, language=language, word_timestamps=True)
            for segment in segments:
                result_text += segment.text + " "
                for word in segment.words:
                    words.append({
                        "word": word.word,
                        "start": word.start,
                        "end": word.end,
                        "probability": word.probability
                    })
        elif engine == "vosk":
            load_vosk()
            from vosk import KaldiRecognizer
            wf = wave.open(tmp_path, "rb")
            if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
                # Vosk requires mono 16-bit
                raise Exception("Audio file must be WAV format mono PCM.")
            
            rec = KaldiRecognizer(vosk_model, wf.getframerate())
            rec.SetWords(True)
            
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                rec.AcceptWaveform(data)
            
            final_res = json.loads(rec.FinalResult())
            result_text = final_res.get("text", "")
            if "result" in final_res:
                for w in final_res["result"]:
                    words.append({
                        "word": w["word"],
                        "start": w["start"],
                        "end": w["end"]
                    })
        else:
            raise Exception(f"Unknown engine: {engine}")
            
        # Clean up
        os.unlink(tmp_path)
        
        return {
            "status": "success", 
            "text": result_text.strip(),
            "words": words
        }
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/status")
def get_status():
    return {
        "status": "running", 
        "engines_available": ["faster-whisper", "vosk"]
    }

if __name__ == "__main__":
    # Start server on port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
