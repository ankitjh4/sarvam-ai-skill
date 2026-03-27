---
name: sarvam-ai
description: "Indian AI toolkit powered by Sarvam AI — text-to-speech, speech-to-text, document intelligence, translation, transliteration, language detection, and chat completion across 23 Indian languages. Use when working with Indian languages, Hindi/Tamil/Bengali text, Sarvam AI, or when the user needs translation, transcription, or TTS for South Asian languages."
metadata:
  author: ankitjh4
  category: External
  display-name: Indian AI Toolkit (Sarvam)
---

# Sarvam AI — Indian Language Toolkit

Comprehensive AI toolkit for 23 Indian languages: TTS, STT, Document Intelligence, Translation, Transliteration, Language Detection, and Chat.

## Setup

1. Get a free API key at https://dashboard.sarvam.ai
2. Set environment variable: `export SARVAM_API_KEY="your-api-key"`

## Supported Languages

`hi-IN` Hindi, `en-IN` English, `bn-IN` Bengali, `gu-IN` Gujarati, `kn-IN` Kannada, `ml-IN` Malayalam, `mr-IN` Marathi, `or-IN`/`od-IN` Odia, `pa-IN` Punjabi, `ta-IN` Tamil, `te-IN` Telugu, `ur-IN` Urdu, `as-IN` Assamese, `bodo-IN`/`brx-IN` Bodo, `doi-IN` Dogri, `ks-IN` Kashmiri, `kok-IN` Konkani, `mai-IN` Maithili, `mni-IN` Manipuri, `ne-IN` Nepali, `sa-IN` Sanskrit, `sat-IN` Santali, `sd-IN` Sindhi

---

## Text-to-Speech

```bash
python3 scripts/tts.py "नमस्ते, आप कैसे हैं?" --language hi-IN --speaker meera
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `text` | — | Text to convert (max 2500 chars) |
| `--language` | hi-IN | Language code |
| `--speaker` | meera | Voice name |
| `--output` | output.wav | Output file |
| `--sample-rate` | 24000 | Audio sample rate |

**Speakers** — Female: Meera, Priya, Neha, Simran, Kavya, Ishita, Shreya, and more. Male: Shubh, Aditya, Rahul, Amit, Dev, Arjun, and more.

---

## Speech-to-Text

Three modes: REST (quick, <30s), WebSocket (real-time streaming), Batch (long audio, diarization).

```bash
# REST — quick transcription
python3 scripts/speech_to_text.py rest audio.mp3

# WebSocket — real-time streaming
python3 scripts/speech_to_text.py websocket audio.wav

# Batch — multiple files with speaker diarization
python3 scripts/speech_to_text.py batch audio1.mp3 audio2.mp3 --diarization --num-speakers 3 --output-dir ./transcripts/
```

**Batch workflow:** create job → upload files → start → poll status (Accepted → Pending → Running → Completed) → download results.

**Formats:** WAV, MP3, AAC, AIFF, OGG, OPUS, FLAC, MP4/M4A, AMR, WMA, WebM, PCM

---

## Document Intelligence

Extract text from PDFs and images (JPEG/PNG).

```bash
python3 scripts/document_intelligence.py document.pdf --language hi-IN --format md
python3 scripts/document_intelligence.py --job-id <id> --download -o ./output/
```

**Formats:** `md` (default), `html`, `json`. Max 200 MB, 500 pages.

---

## Translation

```bash
# Auto-detect source, translate to Hindi
python3 scripts/text_processing.py translate "Hello, how are you?" --target hi-IN

# Mayura model with colloquial mode
python3 scripts/text_processing.py translate "What's up?" --target hi-IN --model mayura:v1 --mode modern-colloquial
```

**Models:** `sarvam-translate:v1` (23 languages), `mayura:v1` (12 languages, supports modes and transliteration)

**Modes** (mayura only): `formal`, `modern-colloquial`, `classic-colloquial`, `code-mixed`

---

## Transliteration

```bash
python3 scripts/text_processing.py transliterate "नमस्ते" --source hi-IN --target en-IN
python3 scripts/text_processing.py transliterate "namaste" --source en-IN --target hi-IN --spoken-form
```

---

## Language Detection

```bash
python3 scripts/text_processing.py detect "नमस्ते दुনিয়া"
# Output: Language: hi-IN, Script: Deva
```

---

## Chat Completion

Two models: `sarvam-105b` (flagship, complex reasoning) and `sarvam-m` (efficient, general chat).

```bash
python3 scripts/text_processing.py chat "Explain quantum computing" --model sarvam-105b
python3 scripts/text_processing.py chat "What is the capital of India?" --model sarvam-m --temperature 0.8
```

---

## Resources

- Dashboard: https://dashboard.sarvam.ai
- Docs: https://docs.sarvam.ai
- Cookbook: https://github.com/sarvamai/sarvam-ai-cookbook
