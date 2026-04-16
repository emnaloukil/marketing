# AI Tutor API

Service d'API pour l'apprentissage adaptatif basé sur les PDF. Transforme le notebook Colab en API REST.

## 🚀 Démarrage Rapide

### Installation

```bash
cd aiTutorial-api
pip install -r requirements.txt
python main.py
```

Le serveur démarre sur `http://localhost:5001`

## 🔌 Endpoints

### 1️⃣ **Generate Explanation**
```
POST /api/explain
{
  "courseId": "crs_001",
  "content": "texte du PDF",
  "learnerProfile": {
    "age": 9,
    "level": "beginner",
    "language": "en"
  }
}

Response:
{
  "explanation": "Texte simplifié",
  "confidence": 0.95
}
```

### 2️⃣ **Generate Audio**
```
POST /api/audio
{
  "text": "Explication à convertir"
}

Response:
{
  "audioUrl": "/files/audio_xxx.mp3",
  "duration": 15.5
}
```

### 3️⃣ **Generate Video (Cartoon Avatar)**
```
POST /api/video
{
  "text": "Explication",
  "avatar": "student"
}

Response:
{
  "videoUrl": "/files/video_xxx.mp4",
  "duration": 45.2
}
```

### 4️⃣ **Generate Quiz**
```
POST /api/quiz
{
  "content": "texte du PDF",
  "difficulty": "medium",
  "numQuestions": 5
}

Response:
{
  "quiz": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ]
}
```

## 🏗️ Architecture

```
PDF Upload → Text Extraction → Chunking → Embeddings
                                    ↓
                            FAISS Vector Store
                                    ↓
                        Semantic Search + LLM
                                    ↓
          ┌─────────────────────────────────────────┐
          ↓              ↓              ↓            ↓
      Explanation    Audio         Video         Quiz
      (gTTS)        (Manim)      (Manim+gTTS)    (JSON)
```

## 📦 Stack

- **Framework**: FastAPI (Python)
- **PDF Parsing**: PyMuPDF
- **Embeddings**: sentence-transformers (local, free)
- **Vector Search**: FAISS (in-RAM, free)
- **LLM**: Qwen3 via OpenRouter (pay-per-token)
- **Text-to-Speech**: gTTS (free)
- **Video**: Manim + moviepy (free)

## 🔑 Configuration

Variables d'environnement requises:

```env
OPENROUTER_API_KEY=your_key_here
MONGODB_URI=your_mongo_uri
SERVICE_PORT=5001
```

## 🧪 Tests

```bash
python -m pytest tests/
```

## 📝 Notes

- Cette API est **indépendante** du chatbot-api
- Les résultats sont cachés pendant 24h
- Les fichiers généré (audio/vidéo) sont stockés dans `/files/`
