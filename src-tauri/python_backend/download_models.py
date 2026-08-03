import os
import urllib.request
import zipfile

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
# Using the smaller Linto Arabic model for Vosk (very lightweight ~50MB)
VOSK_MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-ar-0.22-linto-1.1.0.zip"
VOSK_MODEL_ZIP = os.path.join(MODELS_DIR, "vosk-model-ar-0.22-linto-1.1.0.zip")
VOSK_MODEL_DIR = os.path.join(MODELS_DIR, "vosk-model-ar-0.22-linto-1.1.0")

def download_vosk():
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
        
    if os.path.exists(VOSK_MODEL_DIR):
        print("Vosk Arabic model already exists.")
    else:
        print("Downloading Vosk Arabic model (this might take a minute)...")
        urllib.request.urlretrieve(VOSK_MODEL_URL, VOSK_MODEL_ZIP)
        
        print("Extracting model...")
        with zipfile.ZipFile(VOSK_MODEL_ZIP, 'r') as zip_ref:
            zip_ref.extractall(MODELS_DIR)
            
        # Clean up zip
        os.remove(VOSK_MODEL_ZIP)
        print("Vosk model ready!")

def download_faster_whisper():
    print("Downloading Faster-Whisper 'base' model...")
    # faster-whisper uses huggingface_hub to download
    try:
        from huggingface_hub import snapshot_download
        model_path = os.path.join(MODELS_DIR, "models--Systran--faster-whisper-base")
        if not os.path.exists(model_path):
            snapshot_download(repo_id="Systran/faster-whisper-base", local_dir=model_path)
            print("Faster-Whisper model ready!")
        else:
            print("Faster-Whisper model already exists.")
    except ImportError:
        print("huggingface_hub is not installed. Run 'pip install huggingface_hub'")

if __name__ == "__main__":
    download_vosk()
    download_faster_whisper()
    print("All models downloaded and ready for bundling.")
