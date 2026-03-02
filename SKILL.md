---
name: sarvam-ai
description: Complete Sarvam AI integration for Indian language TTS (Text-to-Speech), STT (Speech-to-Text), and Document Intelligence. Supports 10+ Indian languages including Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi, and English. Use for high-quality Indian voice synthesis, transcription, and PDF document processing.
metadata:
  author: kimi-claw
  version: "1.0.0"
  tags: [tts, stt, speech, indian-languages, hindi, tamil, telugu, bengali, document-intelligence]
---

# Sarvam AI - Complete Indian Language AI Suite

Sarvam AI provides state-of-the-art speech and language AI for Indian languages.

## API Key
Stored in environment: `SARVAM_API_KEY`

## Base URL
```
https://api.sarvam.ai
```

---

## 1. Text-to-Speech (TTS)

Convert text to natural-sounding speech in Indian languages.

### Endpoint
```
POST https://api.sarvam.ai/text-to-speech
```

### Supported Languages

| Language Code | Language | Example |
|--------------|----------|---------|
| `hi-IN` | Hindi | नमस्ते |
| `ta-IN` | Tamil | வணக்கம் |
| `te-IN` | Telugu | నమస్కారం |
| `kn-IN` | Kannada | ನಮಸ್ತೆ |
| `ml-IN` | Malayalam | നമസ്കാരം |
| `mr-IN` | Marathi | नमस्कार |
| `gu-IN` | Gujarati | નમસ્તે |
| `bn-IN` | Bengali | নমস্কার |
| `pa-IN` | Punjabi | ਸਤ ਸ੍ਰੀ ਅਕਾਲ |
| `en-IN` | English (Indian) | Hello |

### Available Speakers

| Speaker | Language | Gender | Style |
|---------|----------|--------|-------|
| `meera` | Hindi | Female | Natural, conversational |
| `pavithra` | Tamil | Female | Warm, friendly |
| `mukesh` | Hindi | Male | Professional, clear |
| `arjun` | Multi | Male | News anchor style |
| `asha` | Multi | Female | Storyteller |

### Basic TTS Example

```python
import os
import requests

def text_to_speech(text, language="hi-IN", speaker="meera"):
    """
    Convert text to speech using Sarvam AI
    
    Args:
        text: Text to convert (max 500 chars per request)
        language: Language code (e.g., 'hi-IN', 'ta-IN')
        speaker: Voice speaker ID
    
    Returns:
        Audio bytes (WAV format)
    """
    response = requests.post(
        "https://api.sarvam.ai/text-to-speech",
        headers={
            "api-subscription-key": os.environ["SARVAM_API_KEY"],
            "Content-Type": "application/json"
        },
        json={
            "inputs": [text],
            "target_language_code": language,
            "speaker": speaker,
            "pitch": 0,
            "pace": 1.0,
            "loudness": 1.0
        }
    )
    response.raise_for_status()
    return response.content

# Example usage
audio = text_to_speech("नमस्ते, आप कैसे हैं?", "hi-IN", "meera")
with open("output.wav", "wb") as f:
    f.write(audio)
```

### TTS with Custom Voice Settings

```python
def text_to_speech_advanced(text, language, speaker, pitch=0, pace=1.0, loudness=1.0):
    """
    Advanced TTS with voice customization
    
    Args:
        pitch: -10 to 10 (lower = deeper voice)
        pace: 0.5 to 2.0 (1.0 = normal speed)
        loudness: 0.5 to 2.0 (1.0 = normal volume)
    """
    response = requests.post(
        "https://api.sarvam.ai/text-to-speech",
        headers={
            "api-subscription-key": os.environ["SARVAM_API_KEY"],
            "Content-Type": "application/json"
        },
        json={
            "inputs": [text],
            "target_language_code": language,
            "speaker": speaker,
            "pitch": pitch,
            "pace": pace,
            "loudness": loudness
        }
    )
    return response.content
```

### TTS Best Practices

1. **Chunk Long Text**: Split text >500 characters into multiple requests
   ```python
   def chunk_text(text, max_length=500):
       """Split long text into chunks"""
       words = text.split()
       chunks = []
       current = ""
       for word in words:
           if len(current) + len(word) + 1 <= max_length:
               current += " " + word if current else word
           else:
               chunks.append(current)
               current = word
       if current:
           chunks.append(current)
       return chunks
   
   def tts_long_text(text, language="hi-IN", speaker="meera"):
       """TTS for long text with chunking"""
       chunks = chunk_text(text)
       audio_parts = []
       for chunk in chunks:
           audio = text_to_speech(chunk, language, speaker)
           audio_parts.append(audio)
       # Concatenate audio parts using pydub or similar
       return audio_parts
   ```

2. **Choose Right Speaker**: Match speaker to content type
   - News/Formal: `arjun`
   - Conversational: `meera`, `mukesh`
   - Storytelling: `asha`

3. **Optimize Pace**: Use 0.9-1.1 for natural speech, slower for learning content

4. **Cache Audio**: Store generated speech to reduce API calls
   ```python
   import hashlib
   import os
   
   def get_cached_tts(text, language, speaker):
       cache_key = hashlib.md5(f"{text}:{language}:{speaker}".encode()).hexdigest()
       cache_file = f"/tmp/tts_cache/{cache_key}.wav"
       
       if os.path.exists(cache_file):
           with open(cache_file, "rb") as f:
               return f.read()
       
       audio = text_to_speech(text, language, speaker)
       os.makedirs("/tmp/tts_cache", exist_ok=True)
       with open(cache_file, "wb") as f:
           f.write(audio)
       return audio
   ```

---

## 2. Speech-to-Text (STT)

Convert speech/audio to text in Indian languages.

### Supported APIs

1. **REST API** - Single audio file transcription
2. **Batch API** - Multiple files/async processing
3. **Streaming API** - Real-time transcription

### REST API (Single File)

```python
import requests
import os

def speech_to_text(audio_file_path, language_code="hi-IN"):
    """
    Transcribe audio file to text
    
    Args:
        audio_file_path: Path to audio file (wav, mp3, m4a)
        language_code: Language code (e.g., 'hi-IN', 'ta-IN')
    
    Returns:
        Transcription text
    """
    with open(audio_file_path, "rb") as f:
        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={
                "api-subscription-key": os.environ["SARVAM_API_KEY"]
            },
            files={"file": f},
            data={"language_code": language_code}
        )
    response.raise_for_status()
    return response.json()["transcript"]

# Example
 transcript = speech_to_text("recording.wav", "hi-IN")
print(transcript)  # "नमस्ते, आप कैसे हैं?"
```

### STT with Speaker Diarization

```python
def speech_to_text_with_diarization(audio_file_path, language_code="hi-IN", num_speakers=2):
    """
    Transcribe with speaker identification
    
    Args:
        num_speakers: Expected number of speakers in audio
    """
    with open(audio_file_path, "rb") as f:
        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={
                "api-subscription-key": os.environ["SARVAM_API_KEY"]
            },
            files={"file": f},
            data={
                "language_code": language_code,
                "enable_diarization": "true",
                "num_speakers": num_speakers
            }
        )
    result = response.json()
    return result

# Example result:
# {
#   "transcript": "Speaker 1: नमस्ते\nSpeaker 2: नमस्ते, कैसे हैं आप?",
#   "segments": [
#     {"speaker": "SPEAKER_00", "text": "नमस्ते", "start": 0.0, "end": 1.2},
#     {"speaker": "SPEAKER_01", "text": "नमस्ते, कैसे हैं आप?", "start": 1.5, "end": 4.0}
#   ]
# }
```

### Batch API (Multiple Files)

```python
def batch_stt(audio_files, language_code="hi-IN"):
    """
    Process multiple audio files asynchronously
    
    Args:
        audio_files: List of file paths
    """
    files = [("files", open(f, "rb")) for f in audio_files]
    
    response = requests.post(
        "https://api.sarvam.ai/speech-to-text/batch",
        headers={
            "api-subscription-key": os.environ["SARVAM_API_KEY"]
        },
        files=files,
        data={"language_code": language_code}
    )
    
    job_id = response.json()["job_id"]
    
    # Poll for completion
    while True:
        status = requests.get(
            f"https://api.sarvam.ai/speech-to-text/batch/{job_id}",
            headers={"api-subscription-key": os.environ["SARVAM_API_KEY"]}
        ).json()
        
        if status["status"] == "completed":
            return status["results"]
        elif status["status"] == "failed":
            raise Exception(f"Batch failed: {status.get('error')}")
        
        time.sleep(5)  # Wait before polling again
```

### Streaming API (Real-time)

```python
import websocket
import json
import threading

def stream_stt(language_code="hi-IN"):
    """
    Real-time streaming STT
    """
    ws_url = f"wss://api.sarvam.ai/speech-to-text/stream?language_code={language_code}"
    
    def on_message(ws, message):
        data = json.loads(message)
        print(f"Transcript: {data.get('transcript', '')}")
    
    def on_open(ws):
        # Start sending audio chunks
        def send_audio():
            # Read audio in chunks and send
            while True:
                chunk = read_audio_chunk()  # Your audio source
                if chunk:
                    ws.send(chunk, opcode=websocket.ABNF.OPCODE_BINARY)
                else:
                    break
        
        threading.Thread(target=send_audio).start()
    
    ws = websocket.WebSocketApp(
        ws_url,
        header={"api-subscription-key": os.environ["SARVAM_API_KEY"]},
        on_message=on_message,
        on_open=on_open
    )
    ws.run_forever()
```

### STT Best Practices

1. **Specify Correct Language**: Always use proper locale codes
   ```python
   # Correct
   "hi-IN"  # Hindi (India)
   "ta-IN"  # Tamil (India)
   
   # Incorrect
   "hi"     # Missing locale
   ```

2. **Audio Format**: Use WAV or MP3, 16kHz+ sample rate for best results

3. **Enable Diarization for Meetings**: Identify different speakers

4. **Output Mode Selection**:
   ```python
   # Verbatim (exact transcription including fillers)
   data={"language_code": "hi-IN", "output_mode": "verbatim"}
   
   # Clean (remove filler words, corrected grammar)
   data={"language_code": "hi-IN", "output_mode": "clean"}
   ```

---

## 3. Document Intelligence

Extract text and structure from PDF documents.

```python
def extract_pdf_text(pdf_file_path):
    """
    Extract text from PDF documents
    
    Supports: Invoices, Forms, Receipts, Contracts
    """
    with open(pdf_file_path, "rb") as f:
        response = requests.post(
            "https://api.sarvam.ai/document-intelligence",
            headers={
                "api-subscription-key": os.environ["SARVAM_API_KEY"]
            },
            files={"file": f}
        )
    response.raise_for_status()
    return response.json()

# Example result:
# {
#   "text": "Extracted full text from document...",
#   "structured_data": {
#     "invoice_number": "INV-001",
#     "date": "2024-01-15",
#     "total_amount": "₹1,500.00"
#   },
#   "tables": [...],
#   "key_value_pairs": {...}
# }
```

---

## Quick Reference

### TTS Quick Start
```python
import os, requests

def quick_tts(text, lang="hi-IN"):
    r = requests.post(
        "https://api.sarvam.ai/text-to-speech",
        headers={"api-subscription-key": os.environ["SARVAM_API_KEY"], "Content-Type": "application/json"},
        json={"inputs": [text], "target_language_code": lang, "speaker": "meera"}
    )
    return r.content
```

### STT Quick Start
```python
def quick_stt(file_path, lang="hi-IN"):
    with open(file_path, "rb") as f:
        r = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"api-subscription-key": os.environ["SARVAM_API_KEY"]},
            files={"file": f},
            data={"language_code": lang}
        )
    return r.json()["transcript"]
```

---

## Links

- **Documentation**: https://docs.sarvam.ai
- **API Reference**: https://docs.sarvam.ai/api-reference-docs
- **Cookbook**: https://github.com/sarvamai/sarvam-ai-cookbook
