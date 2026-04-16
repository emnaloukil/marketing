# Integration Guide: AI Tutor API with Course Page

## 📋 Overview

The Course page has 4 action buttons that now connect to the AI Tutor API:

1. **🎬 Generate Video** - Creates animated explainer with cartoon avatar
2. **🎧 Generate Audio** - Converts lesson to spoken audio
3. **📝 Text Explanation** - Generates simplified text explanation
4. **🎯 Take a Quiz** - Creates interactive quiz questions

## 🔧 How to Integrate

### Step 1: Import the Hook

In `Coursepage.jsx`:

```jsx
import { useAITutor } from '../../hooks/useAITutor'
```

### Step 2: Use the Hook

Add inside your component:

```jsx
const { generateVideo, generateAudio, generateExplanation, generateQuiz, loading, error } = useAITutor()
const { student } = useStudent()
```

### Step 3: Connect Buttons to API

Replace the placeholder button clicks with actual API calls:

```jsx
async function handleGenerateVideo() {
  try {
    const result = await generateVideo(
      resolvedCourse.title, // Text to narrate
      'student' // Avatar type
    )
    // Show video player with result.videoUrl
    console.log('Video ready:', result.videoUrl)
  } catch (err) {
    console.error('Video generation failed:', err)
  }
}

async function handleGenerateAudio() {
  try {
    const result = await generateAudio(resolvedCourse.title)
    // Show audio player with result.audioUrl
    console.log('Audio ready:', result.audioUrl)
  } catch (err) {
    console.error('Audio generation failed:', err)
  }
}

async function handleGenerateExplanation() {
  try {
    const result = await generateExplanation(
      resolvedCourse.id,
      resolvedCourse.title,
      resolvedCourse.title, // Replace with actual PDF content
      {
        age: student.age || 10,
        level: 'beginner',
        language: 'en'
      }
    )
    // Display result.explanation in modal
    console.log('Explanation:', result.explanation)
  } catch (err) {
    console.error('Explanation generation failed:', err)
  }
}

async function handleGenerateQuiz() {
  try {
    const result = await generateQuiz(
      resolvedCourse.title, // Replace with actual PDF content
      'medium',
      5
    )
    // Display result.quiz questions in modal
    console.log('Quiz questions:', result.quiz)
  } catch (err) {
    console.error('Quiz generation failed:', err)
  }
}
```

## 🎯 Example: Complete Action Button Click Handler

```jsx
const ACTION_BUTTONS = [
  {
    id: "video",
    label: "Generate Video",
    emoji: "🎬",
    desc: "Watch an animated explainer",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444, #F97316)",
    icon: <svg>...</svg>,
    onClick: handleGenerateVideo
  },
  {
    id: "audio",
    label: "Generate Audio",
    emoji: "🎧",
    desc: "Listen to the lesson read aloud",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    icon: <svg>...</svg>,
    onClick: handleGenerateAudio
  },
  {
    id: "explanation",
    label: "Text Explanation",
    emoji: "📝",
    desc: "Read a simplified summary",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #06B6D4)",
    icon: <svg>...</svg>,
    onClick: handleGenerateExplanation
  },
  {
    id: "quiz",
    label: "Take a Quiz",
    emoji: "🎯",
    desc: "Test your knowledge",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    icon: <svg>...</svg>,
    onClick: handleGenerateQuiz
  },
];
```

## 🔌 API Response Format

### Video Response
```json
{
  "videoUrl": "/files/video_abc123.mp4",
  "duration": 45.2,
  "format": "mp4"
}
```

### Audio Response
```json
{
  "audioUrl": "/files/audio_abc123.mp3",
  "duration": 15.5,
  "format": "mp3"
}
```

### Explanation Response
```json
{
  "explanation": "Simplified explanation text...",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "difficulty": "beginner",
  "confidence": 0.95
}
```

### Quiz Response
```json
{
  "quiz": [
    {
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Because..."
    }
  ],
  "totalQuestions": 5
}
```

## 📱 Loading & Error States

```jsx
{loading && <div>Processing with AI... ⏳</div>}
{error && <div style={{color: 'red'}}>Error: {error}</div>}
{data && displayResult(data)}
```

## 🚀 Environment Variables

Add to frontend `.env`:

```env
VITE_AI_TUTOR_API_URL=http://localhost:5001/api
```

## 📂 File Structure

```
frontend/src/
├── api/
│   └── aiTutorClient.js          ← API client
├── hooks/
│   └── useAITutor.js             ← React hook
└── pages/student/
    └── Coursepage.jsx             ← Integration point
```

## ⚠️ Important Notes

1. **Different from chatbot-api**: This is a separate service on port 5001
2. **PDFContent**: Replace `resolvedCourse.title` with actual PDF text extraction
3. **Caching**: Results are cached for 24 hours by default
4. **Dependencies**: Requires aiTutorial-api running on port 5001

## 🧪 Testing

Test the API manually:

```bash
# Test explanation
curl -X POST http://localhost:5001/api/explain \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "crs_001",
    "courseTitle": "Fractions",
    "content": "Test content",
    "learnerProfile": {"age": 10, "level": "beginner", "language": "en"}
  }'
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find aiTutorClient" | Check import path is correct |
| API returns 500 | Ensure aiTutorial-api service is running |
| Missing OPENROUTER_API_KEY | Add to aiTutorial-api `.env` file |
| Video generation slow | First run generates Manim animations (~60s) |
| Quiz questions are generic | Provide actual PDF content, not just titles |

---

**Next Steps**: Once you have the API client connected, you can add proper error handling, progress indicators, and media players to display the results!
