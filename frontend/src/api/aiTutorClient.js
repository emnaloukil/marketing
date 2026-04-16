/**
 * AI Tutor API Client
 * 
 * Integration with the aiTutorial-api service
 * Handles 4 core features:
 * 1. Adaptive Explanations
 * 2. Audio Generation
 * 3. Cartoon Video Generation
 * 4. Quiz Generation
 */

const BASE_URL = import.meta.env.VITE_AI_TUTOR_API_URL || '/ai-api'
const HEALTH_URL = import.meta.env.VITE_AI_TUTOR_HEALTH_URL || '/health'
const AI_API_ORIGIN = BASE_URL.startsWith('http')
  ? BASE_URL.replace(/\/api\/?$/, '')
  : ''

async function parseJson(response) {
  let json = {}
  try {
    json = await response.json()
  } catch {
    json = {}
  }

  if (!response.ok) {
    throw new Error(json.detail || json.message || 'AI request failed')
  }

  return json
}

function withAbsoluteMediaUrl(url) {
  if (!url || /^https?:\/\//i.test(url) || !AI_API_ORIGIN) return url
  if (url.startsWith('/')) return `${AI_API_ORIGIN}${url}`
  return `${AI_API_ORIGIN}/${url}`
}

/**
 * Generate adaptive explanation
 */
export const aiTutorAPI = {
  // 🎓 Generate Adaptive Explanation
  generateExplanation: async (...args) => {
    const payload =
      typeof args[0] === 'object' && args[0] !== null
        ? args[0]
        : {
            courseId: args[0],
            courseTitle: args[1],
            content: args[2],
            learnerProfile: args[3],
          }

    try {
      const response = await fetch(`${BASE_URL}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return await parseJson(response)
    } catch (error) {
      console.error('Explanation error:', error)
      throw error
    }
  },

  // 🎧 Generate Audio
  generateAudio: async (...args) => {
    const payload =
      typeof args[0] === 'object' && args[0] !== null
        ? args[0]
        : {
            text: args[0],
            language: args[1] ?? 'en',
            speed: args[2] ?? 1.0,
            courseFileUrl: args[3] ?? '',
          }

    try {
      const response = await fetch(`${BASE_URL}/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await parseJson(response)
      return {
        ...json,
        audioUrl: withAbsoluteMediaUrl(json.audioUrl),
      }
    } catch (error) {
      console.error('Audio generation error:', error)
      throw error
    }
  },

  // 🎬 Generate Video with Cartoon Avatar
  generateVideo: async (...args) => {
    const payload =
      typeof args[0] === 'object' && args[0] !== null
        ? {
            ...args[0],
            avatar_gender:
              args[0].avatar_gender ||
              (args[0].avatar === 'boy' ? 'boy' : 'girl'),
          }
        : {
            text: args[0],
            avatar: args[1] ?? 'student',
            duration: args[2] ?? null,
            avatar_gender: args[1] === 'boy' ? 'boy' : 'girl',
          }

    try {
      const response = await fetch(`${BASE_URL}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await parseJson(response)
      return {
        ...json,
        videoUrl: withAbsoluteMediaUrl(json.videoUrl),
      }
    } catch (error) {
      console.error('Video generation error:', error)
      throw error
    }
  },

  // 🎯 Generate Quiz
  generateQuiz: async (...args) => {
    const payload =
      typeof args[0] === 'object' && args[0] !== null
        ? args[0]
        : {
            content: args[0],
            difficulty: args[1] ?? 'medium',
            numQuestions: args[2] ?? 5,
          }

    try {
      const response = await fetch(`${BASE_URL}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return await parseJson(response)
    } catch (error) {
      console.error('Quiz generation error:', error)
      throw error
    }
  },

  // 📄 Upload PDF
  uploadPDF: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${BASE_URL}/upload-pdf`, {
        method: 'POST',
        body: formData,
      })
      return await parseJson(response)
    } catch (error) {
      console.error('PDF upload error:', error)
      throw error
    }
  },

  // 🏥 Health check
  health: async () => {
    try {
      const response = await fetch(HEALTH_URL)
      return await response.json()
    } catch (error) {
      console.error('Health check error:', error)
      return { status: 'error' }
    }
  },
}
