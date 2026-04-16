# AI Tutor API - Test Results ✅

**Service Status:** Running on `http://localhost:5001`  
**Test Date:** April 14, 2026

---

## 📊 Endpoint Test Results

### ✅ 1. Health Check
```
GET http://localhost:5001/health
Status: 200 OK
Response: {"status":"ok","service":"AI Tutor API","version":"1.0.0"}
```

### ✅ 2. Audio Generation 
```
POST http://localhost:5001/api/audio
Status: 200 OK
Request:
{
  "text": "Hello! Today we will learn about photosynthesis. Plants use sunlight to make energy.",
  "language": "en",
  "speed": 1.0
}

Response:
{
  "audioUrl": "/files/audio_9d27fe11.mp3",
  "duration": 4.6,
  "format": "mp3"
}
```
✅ **Working:** Audio MP3 files are generated and accessible

---

### 🟡 3. Video Generation
**Status:** Needs Configuration
- Requires `ffmpeg` and Python imaging libraries
- Returns error: "Video generation failed"
- **Fix:** Install ffmpeg: `choco install ffmpeg` or `scoop install ffmpeg`

---

### 🔴 4. Quiz Generation
**Status:** Needs API Key
- Endpoint: `POST /api/quiz`
- Requires: `OPENROUTER_API_KEY` environment variable
- **Fix:** Add to `.env`:
  ```
  OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
  ```
- Get free key: https://openrouter.ai

---

### 🔴 5. Explanation Generation  
**Status:** Needs API Key
- Endpoint: `POST /api/explain`
- Requires: `OPENROUTER_API_KEY` environment variable
- Same fix as Quiz above

---

### ✅ 6. PDF Upload
**Status:** Ready
- Endpoint: `POST /api/upload-pdf`
- Accepts PDF files
- Extracts text and creates embeddings
- Returns: filename, page count, character count, chunk count

---

## 🎯 What's Working Right Now

1. **✅ API Server** - Running on port 5001
2. **✅ CORS** - Frontend can communicate with API
3. **✅ Audio Generation** - gTTS working, creating MP3 files
4. **✅ PDF Processing** - pdfplumber installed, ready for uploads
5. **✅ Embeddings** - Sentence-transformers model loaded (~90MB)
6. **✅ Vector Search** - FAISS index operational
7. **✅ Request Validation** - Pydantic models validating inputs

---

## 🔧 What Needs Configuration

### Audio/Video Files Not Accessible?
The `/files` mount point serves generated media. Files are saved to:
```
C:\Users\LENOVO\EduKids\aiTutorial-api\files\
```

To access in browser:
```
http://localhost:5001/files/audio_9d27fe11.mp3
http://localhost:5001/files/video_abc123.mp4
```

### To Enable Quiz & Explanations:

1. **Get OpenRouter API Key:**
   - Go to https://openrouter.ai/keys
   - Free API key (no credit card needed)
   - Copy your API key

2. **Add to `.env`:**
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   MONGODB_URI=mongodb://localhost:27017
   SERVICE_PORT=5001
   ```

3. **Restart the service:**
   ```powershell
   # Kill current process
   Stop-Process -Name python -Force
   
   # Start fresh
   cd C:\Users\LENOVO\EduKids\aiTutorial-api
   python main.py
   ```

### To Enable Video Generation:

1. **Install ffmpeg:**
   ```powershell
   # Using Chocolatey (if installed)
   choco install ffmpeg
   
   # Or using Scoop
   scoop install ffmpeg
   
   # Or download manually from https://ffmpeg.org/download.html
   ```

2. **Verify installation:**
   ```powershell
   ffmpeg -version
   ```

3. **Restart the service**

---

## 📱 Test from Frontend

The React app at `http://localhost:3002` already has integration ready:

1. Open a course page
2. Click an AI action button (🎬 Generate Video, 🎧 Generate Audio, etc.)
3. The modal will call the API endpoints
4. Results display in the UI

### Examples:
- **Audio:** Click "🎧 Generate Audio" → Hears lesson narration
- **Explanation:** Click "📝 Text Explanation" → Reads simplified content
- **Quiz:** Click "🎯 Take a Quiz" → Takes interactive quiz  
- **Video:** Click "🎬 Generate Video" → Watches animated lesson

---

## 🚀 Quick Start Commands

**Terminal 1 - Start Backend API:**
```powershell
cd C:\Users\LENOVO\EduKids\aiTutorial-api
python main.py
```

**Terminal 2 - Start Frontend:**
```powershell  
cd C:\Users\LENOVO\EduKids\frontend
npm run dev
```

**Terminal 3 - Test Endpoints:**
```powershell
# Health check
Invoke-WebRequest http://localhost:5001/health -UseBasicParsing

# Test audio (working now)
$body = @{text="Hello world"; language="en"; speed=1.0} | ConvertTo-Json
Invoke-WebRequest http://localhost:5001/api/audio -Method POST -Headers @{"Content-Type"="application/json"} -Body $body -UseBasicParsing

# View generated files
Get-ChildItem C:\Users\LENOVO\EduKids\aiTutorial-api\files\
```

---

## 📋 Complete Quick Reference

```
SERVICE STATUS: ✅ Running on http://localhost:5001

WORKING ENDPOINTS:
  ✅ GET  /health                 → Health check
  ✅ GET  /                       → List all endpoints
  ✅ POST /api/audio              → Generate MP3 audio
  ✅ POST /api/upload-pdf         → Process PDF files
  
CONFIGURATION NEEDED:
  🔴 POST /api/quiz               → Need OpenRouter API key
  🔴 POST /api/explain            → Need OpenRouter API key
  🔴 POST /api/video              → Need ffmpeg installed

GENERATED FILES:
  📂 /files/ → Contains all generated MP3 and MP4 files
  🌐 Accessible at http://localhost:5001/files/

DATABASE:
  🗄️ MongoDB: Ready (if local instance running)
  🔗 FAISS: Vector search initialized
  🔍 Embeddings: all-MiniLM-L6-v2 model loaded
```

---

## ✅ Verification Checklist

- [x] API server starts without errors
- [x] Health endpoint responds 200
- [x] Audio generation works
- [x] Embedding model loads
- [x] PDF text extraction ready
- [x] CORS allows frontend
- [x] Static files mounted for media download
- [ ] (Optional) ffmpeg installed for video
- [ ] (Optional) OpenRouter API key added

---

## 🆘 Troubleshooting

### "pdfplumber not found"
```powershell
pip install pdfplumber pypdf
```

### "sentence-transformers not found"
```powershell
pip install sentence-transformers
```

### "FAISS not found"
```powershell
pip install faiss-cpu
```

### Port 5001 already in use
```powershell
# Find process using port 5001
Get-NetTCPConnection -LocalPort 5001

# Kill the process
Stop-Process -Id <PID> -Force
```

### Service crashes on startup
Check error logs in terminal for missing dependencies, then run:
```powershell
pip install -r requirements.txt --upgrade
```

