# 🚀 EduKids - Single Port Setup (Port 3000)

## ✨ What's New

Everything now runs through **Port 3000**! No need to remember multiple ports.

**Backend Architecture:**
- Frontend + Proxies: `http://localhost:3000` ✅
- Backend API: `http://localhost:5000` (hidden)
- AI Tutor API: `http://localhost:5001` (hidden)

All communication flows through the frontend proxy!

---

## 🎯 Quick Start (Choose One)

### Option 1: Automatic (All-in-One Script) ⭐ RECOMMENDED

Open PowerShell and paste this:

```powershell
cd C:\Users\LENOVO\EduKids
.\START_ALL.ps1
```

This launches all 3 services in separate terminals, then wait 15 seconds and visit:
```
http://localhost:3000
```

### Option 2: Manual - 3 Separate Terminals

**Terminal 1 - Backend (Port 5000):**
```powershell
cd C:\Users\LENOVO\EduKids\backend
npm run dev
```

**Terminal 2 - Frontend (Port 3000):**
```powershell
cd C:\Users\LENOVO\EduKids\frontend
npm run dev
```

**Terminal 3 - AI Tutor API (Port 5001):**
```powershell
cd C:\Users\LENOVO\EduKids\aiTutorial-api
python main.py
```

Then open browser:
```
http://localhost:3000
```

---

## 📡 Proxy Configuration

The frontend now proxies all requests:

| Request | Goes To | Port |
|---------|---------|------|
| `http://localhost:3000/` | Frontend | 3000 |
| `http://localhost:3000/api/*` | Backend | 5000 |
| `http://localhost:3000/ai-api/*` | AI Tutor API | 5001 |
| `http://localhost:3000/files/*` | Generated files | 5001 |

**Example:**
- You call: `POST http://localhost:3000/ai-api/audio`
- Frontend proxy rewrites to: `POST http://localhost:5001/api/audio`
- Returns audio file at: `GET http://localhost:3000/files/audio_xyz.mp3`

---

## ✅ Testing the Setup

### 1. Verify All Services Running

```powershell
# Check Frontend
Invoke-WebRequest http://localhost:3000 | Select-Object StatusCode

# Check Backend (through proxy)
Invoke-WebRequest http://localhost:3000/api -Method OPTIONS | Select-Object StatusCode

# Check AI API (through proxy)  
Invoke-WebRequest http://localhost:3000/ai-api/health | Select-Object StatusCode
```

Expected: All return `StatusCode: 200`

### 2. Test Audio Generation (Works Now!)

```powershell
$body = @{
    text = "Hello! Today we learn about photosynthesis."
    language = "en"
    speed = 1.0
} | ConvertTo-Json

$response = Invoke-WebRequest http://localhost:3000/ai-api/audio `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json
```

**Response:**
```json
{
  "audioUrl": "/files/audio_abc123.mp3",
  "duration": 4.6,
  "format": "mp3"
}
```

**Listen to audio:**
```
http://localhost:3000/files/audio_abc123.mp3
```

### 3. From Browser UI

1. Visit: `http://localhost:3000`
2. Login as Teacher
3. Open a course
4. Click 🎧 (Audio) button
5. Modal loads and after 3-5 seconds shows audio player
6. Click ▶️ to listen

---

## 🔧 Optional: Enable Advanced Features

### Feature 1: Explanations & Quizzes (Need API Key)

1. Sign up: https://openrouter.ai
2. Create file: `aiTutorial-api\.env`
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
3. Restart AI Tutor API (Terminal 3: Ctrl+C, then `python main.py`)
4. Test endpoints 3 & 4 in TEST_ENDPOINTS.md

### Feature 2: Video Generation (Need ffmpeg)

1. Install: 
   ```powershell
   choco install ffmpeg
   ```
   Or: https://ffmpeg.org/download.html

2. Verify:
   ```powershell
   ffmpeg -version
   ```

3. Restart AI Tutor API

4. Video button (🎬) now works

---

## 📂 Files & Generated Media

**Generated files location:**
```
C:\Users\LENOVO\EduKids\aiTutorial-api\files\
│
├── audio_abc123def.mp3    ← Downloaded from /files/audio_abc123def.mp3
├── audio_xyz789uvw.mp3
├── video_test001.mp4      ← Downloaded from /files/video_test001.mp4
└── ...
```

All accessible through port 3000:
```
http://localhost:3000/files/audio_*.mp3
http://localhost:3000/files/video_*.mp4
```

---

## 🧪 Interactive Testing Menu

If you want to test all endpoints manually:

```powershell
cd C:\Users\LENOVO\EduKids\aiTutorial-api
.\test_endpoints.ps1
```

**Note:** This tests on raw ports (5001 directly), but frontend uses proxied paths. Either way works!

---

## ❌ Troubleshooting

### Issue: Cannot connect to http://localhost:3000
**Fix:**
- Ensure Terminal 2 (Frontend) is running
- Check: `npm run dev` output shows `Local: http://localhost:3000/`
- Port not in use: `Get-NetTCPConnection -LocalPort 3000`

### Issue: 404 on `/ai-api/*` endpoints
**Fix:**
- Ensure Terminal 3 (AI Tutor API) is running
- Check main.py output shows: `Application startup complete`
- Restart AI Tutor API: Ctrl+C then `python main.py`

### Issue: Audio button doesn't work
**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click audio button
4. Look for errors
5. Check if `/files/audio_*.mp3` returns 404

### Issue: Services keep crashing
**Fix:**
1. Close all Node/Python processes: `taskkill /F /IM node.exe` + `taskkill /F /IM python.exe`
2. Delete node_modules: `rm -r node_modules` (in frontend & backend)
3. Reinstall: `npm install` (in both)
4. Start fresh: `.\START_ALL.ps1`

---

## 📊 Request Flow Example

**User clicks 🎧 Audio button:**

```
1. Browser (3000)
   └─ POST /ai-api/audio
      └─ Vite Proxy rewrites to http://localhost:5001/api/audio
         └─ FastAPI processes
            └─ Returns {"audioUrl": "/files/audio_xyz123.mp3"}

2. Browser receives and plays
   └─ GET /files/audio_xyz123.mp3
      └─ Vite Proxy to http://localhost:5001/files/audio_xyz123.mp3
         └─ Returns MP3 file
            └─ Browser audio element plays it
```

---

## ✨ Benefits of Single Port Setup

✅ **Simpler URLs** - Everything is `localhost:3000`
✅ **CORS resolved** - All same origin
✅ **Easier sharing** - Single port number to remember
✅ **Better development** - All services accessible from one place
✅ **Production ready** - Can reverse proxy on single port with nginx

---

## 🔐 Production Deployment

When deploying to production:

1. Keep all 3 services on their own internal ports
2. Use Nginx/Load Balancer on port 80/443
3. Configure proxy rules:
   - `/` → Frontend (3000)
   - `/api` → Backend API (5000)
   - `/ai-api` → AI Tutor API (5001)
   - `/files` → AI Tutor API (5001)

This is exactly what we're doing locally in development!

---

## 📈 Next Steps

1. ✅ Run `.\START_ALL.ps1`
2. ✅ Visit `http://localhost:3000`
3. ✅ Test 🎧 Audio button
4. 📋 Add OpenRouter API key for explanations
5. 🎥 Install ffmpeg for video generation
6. 🌱 Deploy to production

