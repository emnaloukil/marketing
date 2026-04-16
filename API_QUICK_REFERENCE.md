# 🎯 AI Tutor API - Quick Reference Card

## Endpoint Status & Testing

### ✅ READY TO TEST (No Configuration Needed)

#### 1. Health Check
```powershell
Invoke-WebRequest http://localhost:5001/health -Method GET
```
**Response:** `{"status":"ok","service":"AI Tutor API","version":"1.0.0"}`

---

#### 2. Audio Generation 🎧
```powershell
$body = @{
    text = "Hello! Today we will learn about photosynthesis."
    language = "en"
    speed = 1.0
} | ConvertTo-Json

Invoke-WebRequest http://localhost:5001/api/audio `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Response:**
```json
{
  "audioUrl": "/files/audio_abc123def.mp3",
  "duration": 4.6,
  "format": "mp3"
}
```

**Access audio:** `http://localhost:5001/files/audio_abc123def.mp3`

---

#### 3. PDF Upload 📄
```powershell
$file = "C:\Users\LENOVO\Documents\lesson.pdf"
$fileItem = Get-Item $file

Invoke-WebRequest http://localhost:5001/api/upload-pdf `
  -Method POST `
  -Form @{file=$fileItem}
```

**Response:**
```json
{
  "filename": "lesson.pdf",
  "pageCount": 5,
  "characterCount": 12450,
  "chunkCount": 25,
  "extractedText": "..."
}
```

---

### ⭕ NEEDS CONFIGURATION

#### 4. Explanation Generation 📝
**Status:** Blocked - Requires OpenRouter API Key

**Setup:**
1. Visit: https://openrouter.ai/signup
2. Create `aiTutorial-api\.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```
3. Restart AI Tutor API

**Then test:**
```powershell
$body = @{
    courseId = "bio-101"
    courseTitle = "Photosynthesis"
    content = "Photosynthesis is..."
    learnerProfile = @{
        age = 10
        level = "beginner"
        language = "en"
        condition = $null
    }
} | ConvertTo-Json

Invoke-WebRequest http://localhost:5001/api/explain `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

#### 5. Quiz Generation 🎯
**Status:** Blocked - Requires OpenRouter API Key (same as #4)

**Test:**
```powershell
$body = @{
    content = "Photosynthesis uses light energy to convert..."
    difficulty = "easy"
    numQuestions = 2
} | ConvertTo-Json

Invoke-WebRequest http://localhost:5001/api/quiz `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

#### 6. Video Generation 🎬
**Status:** Blocked - Requires ffmpeg

**Setup:**
1. Install: `choco install ffmpeg`
2. Or download: https://ffmpeg.org/download.html
3. Verify: `ffmpeg -version`
4. Restart AI Tutor API

**Then test:**
```powershell
$body = @{
    text = "Plants use sunlight to make energy..."
    avatar = "student"
    duration = $null
} | ConvertTo-Json

Invoke-WebRequest http://localhost:5001/api/video `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

## Testing from Frontend

### 1. Launch All Services
```powershell
cd C:\Users\LENOVO\EduKids
.\START_ALL.ps1
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Test Action Button Flows

**For Teachers:**
1. Login as Teacher
2. View a course
3. Click action buttons:
   - 🎧 Audio - **WORKS NOW** ✅
   - 📝 Explain - **Needs API key** 🔑
   - 🎯 Quiz - **Needs API key** 🔑
   - 🎬 Video - **Needs ffmpeg** 🔧

**Example Flow:**
1. Click 🎧 (Audio) button
2. Modal shows loading animation
3. API generates audio (~3-5 seconds)
4. Audio player appears with ▶️ button
5. Click ▶️ to play
6. Audio plays from generated MP3 file

---

## File Locations

| Purpose | Path |
|---------|------|
| Generated Audio | `C:\Users\LENOVO\EduKids\aiTutorial-api\files\audio_*.mp3` |
| Generated Videos | `C:\Users\LENOVO\EduKids\aiTutorial-api\files\video_*.mp4` |
| AI API Config | `C:\Users\LENOVO\EduKids\aiTutorial-api\.env` |
| Backend Config | `C:\Users\LENOVO\EduKids\backend\.env` |
| Frontend Config | `C:\Users\LENOVO\EduKids\frontend\.env` |

---

## Response Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | ✅ Success | Request worked! |
| 400 | ❌ Bad Request | Check JSON format |
| 422 | ⚠️ Validation Error | Missing required fields |
| 500 | 🔴 Server Error | Check terminal logs for details |
| "Cannot connect" | ❌ API not running | Start: `python main.py` |

---

## Interactive Testing

**Use the test menu:**
```powershell
cd C:\Users\LENOVO\EduKids\aiTutorial-api
.\test_endpoints.ps1
```

Then select:
- 1 = Health Check (verify service running)
- 2 = Audio Generation (test working feature)
- 3-5 = Features needing configuration
- 7 = View generated files
- 8 = Exit

---

## Troubleshooting

### Audio Not Playing
- Check browser console for CORS errors
- Ensure file exists: `ls C:\Users\LENOVO\EduKids\aiTutorial-api\files\`
- Try: Force refresh browser (Ctrl+Shift+R)

### API Returning 500
```powershell
# Check service is running
Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -eq 5001}

# View error logs from terminal where you ran: python main.py
```

### Port Already in Use
```powershell
# Find process using port 5001
$process = Get-NetTCPConnection -LocalPort 5001 | Select-Object -First 1
Stop-Process -Id $process.OwningProcess -Force
```

---

## Next Steps

1. ✅ Verify all services running (health checks above)
2. ✅ Test audio generation (works now!)
3. 📋 Set up OpenRouter API key for explanations/quizzes
4. 🎥 Install ffmpeg for video generation
5. 🌐 Test from frontend UI at http://localhost:3000

