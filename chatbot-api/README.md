# Trilingual Chatbot API 🌍
Arabic 🇸🇦 · French 🇫🇷 · English 🇬🇧
✅ 100% gratuit — Groq (LLM) + Whisper local (STT)

---

## 🔑 Obtenir la clé Groq (gratuite)

1. Va sur https://console.groq.com
2. Crée un compte gratuit
3. Clique "API Keys" → "Create API Key"
4. Copie la clé : gsk_...

---

## Installation

```bash
pip install -r requirements.txt
```

---

## Lancer

```bash
export GROQ_API_KEY=gsk_...
uvicorn main:app --reload --port 8000
```

Swagger UI → http://localhost:8000/docs

---

## Endpoints

| Route | Description |
|---|---|
| GET `/` | Infos API |
| GET `/health` | Health check |
| GET `/languages` | Langues supportées |
| GET `/models` | Modèles Groq disponibles |
| POST `/chat` | Message texte → réponse |
| POST `/transcribe` | Audio mic → texte (Whisper local) |

---

## Modèles Groq gratuits disponibles

| Modèle | Description |
|---|---|
| `llama3-70b-8192` | ✅ Défaut — meilleure qualité |
| `llama3-8b-8192` | Plus rapide, léger |
| `mixtral-8x7b-32768` | Contexte long (32k) |
| `gemma2-9b-it` | Google Gemma 2 |

Pour changer le modèle, modifie dans `main.py` :
```python
GROQ_MODEL = "llama3-70b-8192"
```

---

## Exemples

### Chat texte
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour, comment vas-tu ?", "language": "auto"}'
```

### Voix → Texte
```bash
curl -X POST "http://localhost:8000/transcribe?language=auto" \
  -F "file=@recording.wav"
```

### Conversation multi-tours
```json
{
  "message": "Et en arabe ?",
  "language": "fr",
  "history": [
    {"role": "user", "content": "Comment dire bonjour ?"},
    {"role": "assistant", "content": "On dit 'Bonjour' en français."}
  ]
}
```
