# 🚀 EduKids Project - Complete Setup & Testing Guide

## Port Configuration Overview

| Service | Port | Status | Command |
|---------|------|--------|---------|
| **Frontend** (React/Vite) | 3000 | ✅ Running | `npm run dev` |
| **Backend API** (Node.js/Express) | 5000 | ✅ Running | `npm run dev` |
| **AI Tutor API** (FastAPI) | 5001 | ✅ Running | `python main.py` |

---

## Step 1: Start the Backend (Node.js Express API)

### Terminal 1 - Backend Server

```powershell
cd C:\Users\LENOVO\EduKids\backend
npm run dev
```

**Expected Output:**
```
[nodemon] 3.0.1
[nodemon] to restart at any time, type `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,json
Server running on port 5000
MongoDB connected...
Socket.IO initialized
```

---

## Step 2: Start the Frontend (React/Vite)

### Terminal 2 - Frontend Development Server

```powershell
cd C:\Users\LENOVO\EduKids\frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  press h + enter to show help
```

---

## Step 3: Start the AI Tutor API (FastAPI Python)

### Terminal 3 - AI Tutor API

```powershell
cd C:\Users\LENOVO\EduKids\aiTutorial-api
python main.py
```

**Expected Output:**
```
Loading embedding model from HuggingFace...
Model loaded successfully!
INFO:     Uvicorn running on http://0.0.0.0:5001
INFO:     Application startup complete
```

---

## Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Testing Workflow

### 1. **Health Checks** (Verify all services running)

#### Backend Health
```powershell
Invoke-WebRequest http://localhost:5000/health -Method GET -UseBasicParsing
```
Expected: `200 OK`

#### AI Tutor Health
```powershell
Invoke-WebRequest http://localhost:5001/health -Method GET -UseBasicParsing
```
Expected: `200 OK`

---

### 2. **Interactive Test Menu** (Test AI Tutor Endpoints)

Use the provided PowerShell test script:

```powershell
cd C:\Users\LENOVO\EduKids\aiTutorial-api
.\test_endpoints.ps1
```

Choose from:
1. ✅ Health Check
2. ✅ Audio Generation (READY)
3. ❌ Explanation Generation (Needs: OpenRouter API Key)
4. ❌ Quiz Generation (Needs: OpenRouter API Key)
5. ❌ Video Generation (Needs: ffmpeg)
6. ✅ PDF Upload (READY)
7. List Generated Files
8. Exit

---

### 3. **Test from Frontend UI**

#### Login as Teacher
1. Go to http://localhost:3000
2. Select **Teacher** role
3. Login with test credentials

#### Create/View a Course
1. Click on a course or create a new one
2. You should see action buttons: 📝 (Explain) | 🎧 (Audio) | 🎬 (Video) | 🎯 (Quiz)

#### Test Audio Generation (Most Reliable)
1. Click the **🎧 Audio** button
2. Wait for loading animation
3. Audio player appears below buttons
4. Click ▶️ to play the generated audio

#### Other Features
- **📝 Explain**: Generates written explanations (requires OpenRouter API key)
- **🎯 Quiz**: Creates interactive quizzes (requires OpenRouter API key)
- **🎬 Video**: Generates animated videos (requires ffmpeg)

---

## Configuration for Additional Features

### Enable LLM Features (Explanations & Quizzes)

1. Get free API key: https://openrouter.ai/signup
2. Create `.env` in `aiTutorial-api/` folder:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
3. Restart AI Tutor API: Press `Ctrl+C` then `python main.py`
4. Test endpoints 3 & 4 in test menu

### Enable Video Generation

1. Install ffmpeg:
   ```powershell
   choco install ffmpeg
   # or download from: https://ffmpeg.org/download.html
   ```
2. Verify installation:
   ```powershell
   ffmpeg -version
   ```
3. Restart AI Tutor API
4. Test endpoint 5 in test menu

---

## Frontend Integration Details

### Where API Calls Are Made

**File:** `frontend/src/api/aiTutorClient.js`
- Handles all AI Tutor API communication
- Base URL: `http://localhost:5001/api`

**File:** `frontend/src/components/student/AIOutputModal.jsx`
- Displays API results in modal
- Shows audio player, video player, or text output
- Handles quiz interface

### Action Buttons Location

**File:** `frontend/src/pages/teacher/TeacherDashboard.jsx` (or respective teacher/student pages)
- Buttons trigger different API endpoints
- Modal appears with results below buttons

---

## Common Issues & Fixes

### Issue: "Cannot POST /api/audio"
- ❌ AI Tutor API not running
- ✅ Fix: Start Terminal 3 with `python main.py`

### Issue: "Connection refused 0.0.0.0:5001"
- ❌ Port 5001 already in use
- ✅ Fix: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force`

### Issue: CORS errors in browser console
- ❌ API endpoints not properly configured
- ✅ Already configured in main.py - no action needed

### Issue: "No module named 'pdfplumber'"
- ❌ Python dependencies not installed
- ✅ Fix: `pip install -r requirements.txt`

### Issue: Audio generation returns 500 error
- ❌ May be permission issue with `/files` directory
- ✅ Fix: Ensure `aiTutorial-api/files/` directory exists and is writable

---

## File Locations

```
C:\Users\LENOVO\EduKids\
├── frontend/                          (PORT 3000)
│   ├── src/api/aiTutorClient.js       ← API client
│   ├── src/components/student/AIOutputModal.jsx  ← Results display
│   └── vite.config.js                 ← Port configuration
│
├── backend/                           (PORT 5000)
│   ├── src/server.js                  ← Server entry point
│   ├── src/routes/                    ← API endpoints
│   └── package.json
│
└── aiTutorial-api/                    (PORT 5001)
    ├── main.py                        ← FastAPI server
    ├── pipeline/                      ← ML modules
    ├── files/                         ← Generated media
    ├── requirements.txt               ← Python dependencies
    ├── .env                           ← Configuration
    └── test_endpoints.ps1             ← Test script
```

---

## Quick Start Commands (Copy & Paste)

### All-in-One PowerShell (Open 3 terminals automatically)

```powershell
# Terminal 1 - Backend
Start-Process powershell -ArgumentList '-NoExit -Command "cd C:\Users\LENOVO\EduKids\backend; npm run dev"'

# Terminal 2 - Frontend
Start-Process powershell -ArgumentList '-NoExit -Command "cd C:\Users\LENOVO\EduKids\frontend; npm run dev"'

# Terminal 3 - AI API
Start-Process powershell -ArgumentList '-NoExit -Command "cd C:\Users\LENOVO\EduKids\aiTutorial-api; python main.py"'

# Wait for services to start, then open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
```

---

## Monitoring & Debugging

### View Backend Logs
```powershell
Get-Content C:\Users\LENOVO\EduKids\backend\logs.txt -Tail 50 -Wait
```

### View Generated Files
```powershell
Get-ChildItem C:\Users\LENOVO\EduKids\aiTutorial-api\files\ | Format-Table Name, Length, LastWriteTime
```

### Check Running Ports
```powershell
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in 3000, 5000, 5001}
```

---

## Performance Tips

1. **First Load**: Embedding model (~90MB) downloads on first API call - takes 40-60 seconds
2. **Audio Generation**: Typically 2-5 seconds per request
3. **Cache**: Embedding model cached locally after first load
4. **Browser**: Recommended: Chrome/Edge (best performance)

---

## Support

If issues persist:
1. Check terminal output for error messages
2. Run health checks (see Step 1-3 above)
3. Verify all dependencies installed: `npm install` (frontend/backend) + `pip install -r requirements.txt` (API)
4. Clear browser cache: Ctrl+Shift+Delete

