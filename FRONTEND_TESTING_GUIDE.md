# 🎨 Frontend Testing Guide - How to Test from the UI

## 🚀 Start Here

### 1. Launch Everything
```powershell
cd C:\Users\LENOVO\EduKids
.\START_ALL.ps1
```

Wait 15-20 seconds for all services to start.

### 2. Open Browser
```
http://localhost:3000
```

---

## 🔐 Login & Navigation

### For Teachers

1. **Role Selection Page**
   - URL: `http://localhost:3000`
   - Click: "Select Teacher" button (or radio button)

2. **Login Page**
   - Email: `teacher@edukids.com` (or any test email)
   - Password: (check your .env or test credentials)
   - Click: "Login"

3. **Teacher Dashboard**
   - URL: `http://localhost:3000/teacher/dashboard`
   - Shows: Classes, Students, Stats
   - Next: Click on a class or course

### For Students

1. **Role Selection Page**
   - Click: "Select Student" button

2. **Login/Register**
   - Follow prompts
   - May auto-login if no credentials needed

3. **Student Dashboard**
   - Shows: Classrooms, Sessions, Courses
   - Next: Click on a course

---

## 🎯 Test AI Features

### Scenario: Test Audio Generation

1. **Navigate to a Course**
   - From dashboard, click on any course
   - URL should be: `/class/[courseId]` or `/course/[courseId]`

2. **Look for Action Buttons**
   - 🎧 Audio
   - 📝 Explain  
   - 🎯 Quiz
   - 🎬 Video

3. **Click 🎧 Audio Button**
   ```
   Expected Actions:
   ├─ Modal appears
   ├─ Loading animation (3-5 sec)
   ├─ Audio player shown
   └─ Play button (▶️) available
   ```

4. **Play the Audio**
   - Click ▶️ button
   - Listen to generated audio about the course topic
   - Should hear English speech about the lesson

5. **Check Dev Tools (F12)**
   - Open Browser DevTools: F12
   - Go to Network tab
   - Click audio button again
   - Should see: `POST /ai-api/audio` → 200 OK
   - Response shows: `{"audioUrl":"/files/audio_...mp3","duration":...}`

---

### Scenario: Test Explanation (If API Key Set Up)

**Requires:** OpenRouter API key in `.env`

1. Click 📝 Explain button
2. Modal loads
3. Text explanation appears with key points
4. Check Network tab: `POST /ai-api/explain` → 200 OK

---

### Scenario: Test Quiz (If API Key Set Up)

**Requires:** OpenRouter API key in `.env`

1. Click 🎯 Quiz button
2. Modal loads with first question
3. 4 multiple choice options appear
4. Select an answer → Next question
5. After all questions → Score shown with review

---

### Scenario: Test Video (If ffmpeg Installed)

**Requires:** ffmpeg installed + `ffmpeg -version` works

1. Click 🎬 Video button
2. Modal loads (may take longer, 10-30 sec)
3. Video player appears
4. Click ▶️ to play animated video

---

## 🔍 Debugging from Browser

### Open Developer Tools
```
Press: F12
OR Right-click → Inspect
```

### Check Network Requests

1. Open: DevTools → Network tab
2. Click action button (e.g., 🎧)
3. Should see request like:
   ```
   POST http://localhost:3000/ai-api/audio
   
   Request Headers:
   Content-Type: application/json
   
   Request Body:
   {
     "text": "Hello superstar...",
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

### Check Browser Console

1. DevTools → Console tab
2. If there are errors, see messages like:
   ```
   [ERROR] AI Tutor API error: Failed to generate explanation
   ```

3. Common issues:
   - `Failed to fetch` → API not running
   - `500 error` → Missing API key or ffmpeg
   - `404 /files/audio_...` → File not generated

---

## ✅ Verification Checklist

- [ ] Frontend loads on `http://localhost:3000`
- [ ] Can login as teacher/student
- [ ] Can navigate to course/lesson page
- [ ] Action buttons visible: 🎧, 📝, 🎯, 🎬
- [ ] 🎧 Audio button works (most reliable)
- [ ] Audio modal appears with player
- [ ] Audio plays when clicking ▶️
- [ ] DevTools Network shows successful `/ai-api/audio` requests
- [ ] Generated audio files saved in `/files/` directory

---

## 📊 Expected Results

### Audio Generation (✅ WORKING)
```
Click: 🎧 Audio
Wait: 3-5 seconds
Result: Audio player with ▶️ button
Network: POST /ai-api/audio → 200 OK
Files: /files/audio_[UUID].mp3 created
Sound: Listen to speech about lesson topic
```

### Explanation (⭕ NEEDS API KEY)
```
Click: 📝 Explain
If No API Key: Error modal appears
If Has API Key: Text explanation + key points shown
Network: POST /api-api/explain → 200 or 500
Error Message: "Failed to generate explanation"
Solution: Add OPENROUTER_API_KEY to .env
```

### Quiz (⭕ NEEDS API KEY)
```
Click: 🎯 Quiz
If No API Key: Error modal
If Has API Key: Quiz with questions appears
Features: Answer options, scoring, review
Network: POST /ai-api/quiz → 200 or 500
```

### Video (🔴 NEEDS FFMPEG)
```
Click: 🎬 Video
If No ffmpeg: Long wait then error
If Has ffmpeg: Video player appears
Duration: 10-30 seconds load time
Output: Animated video with lesson content
Network: POST /ai-api/video → 200 or 500
Files: /files/video_[UUID].mp4 created
```

---

## 🐛 Troubleshooting During Testing

### Problem: Audio button doesn't appear
**Check:**
- [ ] Correct page loaded (has course content)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Console errors (F12 → Console)

**Fix:**
- Reload page: Ctrl+R
- Hard refresh: Ctrl+Shift+R
- Check browser console for React errors

---

### Problem: Audio button clicked, but nothing happens
**Check:**
- [ ] Terminals show "Application startup complete"
- [ ] Network tab shows request firing
- [ ] Response status code (200, 500, etc.)

**Fix:**
```powershell
# Restart AI Tutor API
cd C:\Users\LENOVO\EduKids\aiTutorial-api
# Ctrl+C in Terminal 3
python main.py  # Restart
```

---

### Problem: Audio player shows but no sound
**Check:**
- [ ] Browser audio not muted
- [ ] Volume is up
- [ ] File exists: `/files/audio_*.mp3`

**Fix:**
1. Check file exists: `ls C:\Users\LENOVO\EduKids\aiTutorial-api\files\`
2. Try different browser (Chrome, Edge, Firefox)
3. Check browser console for audio element errors

---

### Problem: 500 error on other features
**Explanation/Quiz:**
- Cause: Missing OpenRouter API key
- Fix: Get key from https://openrouter.ai → Add to `.env`

**Video:**
- Cause: ffmpeg not installed
- Fix: `choco install ffmpeg` or download from ffmpeg.org

---

## 📱 Testing Across Devices (Same Network)

If you want to test from another computer:

1. Find your machine's IP:
   ```powershell
   ipconfig | find "IPv4"
   # Look for: 192.168.x.x
   ```

2. From other device, visit:
   ```
   http://192.168.x.x:3000
   ```

3. Everything should work the same way!

---

## 📝 Test Report Template

When testing, track results:

```markdown
## Test Date: [DATE]

### Environment
- Frontend: http://localhost:3000 ✅/❌
- Backend: http://localhost:5000 ✅/❌
- AI API: http://localhost:5001 ✅/❌
- All services running: YES/NO

### Feature Tests
- [ ] Audio Generation: ✅ PASS / ⭕ PARTIAL / ❌ FAIL
- [ ] Explanation: ✅ PASS / ⭕ NEEDS KEY / ❌ FAIL
- [ ] Quiz: ✅ PASS / ⭕ NEEDS KEY / ❌ FAIL
- [ ] Video: ✅ PASS / 🔴 NEEDS FFMPEG / ❌ FAIL

### Issues Found
1. [issue] → [status] ✅/❌
2. [issue] → [status] ✅/❌

### Notes
- Generated files: X audio files, Y video files
- API response times: ~[X]ms average
- Error count: [X]
```

---

## 🎓 What You Should See

### Successful Audio Request Flow

```
Browser Console:
> POST http://localhost:3000/ai-api/audio 200

Response:
{
  "audioUrl": "/files/audio_9d27fe11.mp3",
  "duration": 4.6,
  "format": "mp3"
}

Audio file created:
C:\Users\LENOVO\EduKids\aiTutorial-api\files\audio_9d27fe11.mp3

Browser plays:
http://localhost:3000/files/audio_9d27fe11.mp3
```

### Successful Explanation (with API key)

```
Browser Console:
> POST http://localhost:3000/ai-api/explain 200

Response:
{
  "explanation": "Photosynthesis is the process...",
  "keyPoints": [
    "Plants convert sunlight to energy",
    "Occurs in leaves (chloroplasts)",
    ...
  ],
  "difficulty": "beginner",
  "estimatedReadTime": 3
}

Modal displays formatted explanation
```

---

## 🔗 Quick Links

| Task | Go To |
|------|-------|
| Check setup | [PROJECT_STARTUP_GUIDE.md](PROJECT_STARTUP_GUIDE.md) |
| Port config | [SINGLE_PORT_SETUP.md](SINGLE_PORT_SETUP.md) |
| API endpoints | [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) |
| Start services | Run `.\START_ALL.ps1` |
| Test endpoints | Run `.\aiTutorial-api\test_endpoints.ps1` |

