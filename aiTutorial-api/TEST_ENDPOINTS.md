# AI Tutor API - Endpoint Testing Guide

**Service URL:** `http://localhost:5001`  
**Frontend URL:** `http://localhost:3002`

---

## ✅ 1. Health Check Endpoint

### Basic Test (curl):
```bash
curl -X GET http://localhost:5001/health
```

### PowerShell Test:
```powershell
Invoke-WebRequest -Uri http://localhost:5001/health -Method GET -UseBasicParsing | Select-Object -Property StatusCode, Content
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "AI Tutor API",
  "version": "1.0.0"
}
```

---

## 📋 2. Root / Available Endpoints

### PowerShell Test:
```powershell
Invoke-WebRequest -Uri http://localhost:5001/ -Method GET -UseBasicParsing | Select-Object -Property StatusCode, Content
```

**Expected Response:**
Shows all 5 available endpoints with descriptions.

---

## 🎧 3. Audio Generation Endpoint

**Endpoint:** `POST /api/audio`

### PowerShell Test:
```powershell
$body = @{
    text = "Hello! Today we will learn about photosynthesis. Plants use sunlight to make energy."
    language = "en"
    speed = 1.0
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:5001/api/audio `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Object
```

**Request Body:**
```json
{
  "text": "Hello, today we will learn about photosynthesis.",
  "language": "en",
  "speed": 1.0
}
```

**Expected Response:**
```json
{
  "audioUrl": "/files/audio_abc123.mp3",
  "duration": 12.5,
  "format": "mp3"
}
```

**Response Details:**
- `audioUrl`: Path to generated MP3 file (can be played in browser)
- `duration`: Estimated audio duration in seconds
- `format`: Always "mp3"

---

## 📝 4. Explanation Generation Endpoint

**Endpoint:** `POST /api/explain`

⚠️ **Requirements:**
- `OPENROUTER_API_KEY` must be set in `.env`
- Content will be processed through LLM

### PowerShell Test:
```powershell
$body = @{
    courseId = "bio-101"
    courseTitle = "Introduction to Photosynthesis"
    content = "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy. The process occurs in two main stages: light-dependent reactions in the thylakoid membranes of chloroplasts, and light-independent reactions (Calvin cycle) in the stroma."
    learnerProfile = @{
        age = 10
        level = "beginner"
        language = "en"
        condition = $null
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:5001/api/explain `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Object
```

**Expected Response:**
```json
{
  "explanation": "Photosynthesis is how plants make their own food...",
  "keyPoints": [
    "Plants use sunlight for energy",
    "The process creates oxygen",
    "It happens in leaves"
  ],
  "difficulty": "beginner",
  "confidence": 0.9
}
```

---

## 🎯 5. Quiz Generation Endpoint

**Endpoint:** `POST /api/quiz`

⚠️ **Requirements:**
- `OPENROUTER_API_KEY` must be set in `.env`

### PowerShell Test:
```powershell
$body = @{
    content = "Photosynthesis is the process by which plants convert light energy into chemical energy. The light reactions occur in the thylakoid membranes and produce ATP and NADPH. The Calvin cycle occurs in the stroma and produces glucose."
    difficulty = "medium"
    numQuestions = 3
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:5001/api/quiz `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Object
```

**Expected Response:**
```json
{
  "quiz": [
    {
      "question": "Where do the light reactions of photosynthesis occur?",
      "options": ["Stroma", "Thylakoid membranes", "Mitochondria", "Cell membrane"],
      "correctAnswer": "Thylakoid membranes",
      "explanation": "The light reactions happen in the thylakoid membranes where light is captured by chlorophyll."
    }
  ],
  "totalQuestions": 3
}
```

---

## 🎬 6. Video Generation Endpoint

**Endpoint:** `POST /api/video`

### PowerShell Test:
```powershell
$body = @{
    text = "Imagine a plant in bright sunlight. Sunlight shines on the green leaves. Inside the leaves, special structures called chloroplasts capture the light energy. This energy helps the plant make food from water and air."
    avatar = "student"
    duration = $null
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:5001/api/video `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Object
```

**Expected Response:**
```json
{
  "videoUrl": "/files/video_xyz789.mp4",
  "duration": 12.0,
  "format": "mp4"
}
```

---

## 📤 7. PDF Upload & Processing Endpoint

**Endpoint:** `POST /api/upload-pdf`

### PowerShell Test:
```powershell
$filePath = "C:\path\to\your\document.pdf"

$response = Invoke-WebRequest -Uri http://localhost:5001/api/upload-pdf `
  -Method POST `
  -Form @{file=Get-Item $filePath} `
  -UseBasicParsing

$response.Content | ConvertFrom-Json | Format-Object
```

**Expected Response:**
```json
{
  "filename": "document.pdf",
  "status": "uploaded",
  "textExtracted": true,
  "pageCount": 10,
  "characterCount": 5432,
  "chunkCount": 8
}
```

---

## 🧪 Complete Test Script

Save as `test_all_endpoints.ps1`:

```powershell
# AI Tutor API - Complete Endpoint Test Script
$baseUrl = "http://localhost:5001"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [object]$Body
    )
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "Endpoint: $Method $Endpoint" -ForegroundColor DarkGray
    
    try {
        $bodyJson = $Body | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "$baseUrl$Endpoint" `
            -Method $Method `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $bodyJson `
            -UseBasicParsing
        
        Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor White
        $response.Content | ConvertFrom-Json | Format-Object
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 1: Health Check
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing: Health Check" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing
Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host $response.Content

# Test 2: Audio Generation
Test-Endpoint -Name "Audio Generation" `
    -Method "POST" `
    -Endpoint "/api/audio" `
    -Body @{
        text = "Hello! Today we will learn about photosynthesis."
        language = "en"
        speed = 1.0
    }

# Test 3: Explanation (requires OpenRouter API key)
Test-Endpoint -Name "Explanation Generation" `
    -Method "POST" `
    -Endpoint "/api/explain" `
    -Body @{
        courseId = "bio-101"
        courseTitle = "Photosynthesis"
        content = "Photosynthesis is the process by which plants convert light energy into chemical energy."
        learnerProfile = @{
            age = 10
            level = "beginner"
            language = "en"
            condition = $null
        }
    }

# Test 4: Quiz (requires OpenRouter API key)
Test-Endpoint -Name "Quiz Generation" `
    -Method "POST" `
    -Endpoint "/api/quiz" `
    -Body @{
        content = "Photosynthesis uses light energy to make glucose from water and carbon dioxide."
        difficulty = "easy"
        numQuestions = 2
    }

# Test 5: Video Generation
Test-Endpoint -Name "Video Generation" `
    -Method "POST" `
    -Endpoint "/api/video" `
    -Body @{
        text = "Plants use sunlight to make energy. This process is called photosynthesis."
        avatar = "student"
        duration = $null
    }

Write-Host "`n✅ All tests completed!" -ForegroundColor Green
```

### Run the test script:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\test_all_endpoints.ps1
```

---

## 📊 Testing Summary

| Endpoint | Type | Auth Required | Working | Notes |
|----------|------|---------------|---------|-------|
| `/health` | GET | No | ✅ | Always available |
| `/` | GET | No | ✅ | Shows endpoint list |
| `/api/audio` | POST | No | ✅ | Generates MP3 files |
| `/api/explain` | POST | Yes* | 🟡 | Needs OpenRouter API key |
| `/api/quiz` | POST | Yes* | 🟡 | Needs OpenRouter API key |
| `/api/video` | POST | No | ✅ | Generates MP4 files |
| `/api/upload-pdf` | POST | No | ✅ | Processes PDFs |

`*` = Free service available without key (returns placeholder responses)

---

## 🔧 Configuration

### To enable LLM features:

1. Create `.env` in `aiTutorial-api/`:
```
OPENROUTER_API_KEY=your_key_here
MONGODB_URI=mongodb://localhost:27017
SERVICE_PORT=5001
```

2. Get a free OpenRouter API key from: https://openrouter.ai

---

## 🎬 Next Steps

1. ✅ Start the API: `python main.py`
2. ✅ Test endpoints using PowerShell scripts above
3. ✅ Generated media files in `/files` folder
4. ✅ Connect to React frontend at `http://localhost:3002`
5. ✅ Click action buttons to trigger API calls

