/**
 * useAITutor Hook
 * 
 * React hook for easy integration of AI Tutor features
 * Provides loading states, error handling, and caching
 */

import { useState, useCallback } from 'react'
import { aiTutorAPI } from '../api/aiTutorClient'

export function useAITutor() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  // 🎓 Generate Explanation
  const generateExplanation = useCallback(
    async (courseId, courseTitle, content, learnerProfile) => {
      setLoading(true)
      setError(null)
      try {
        const result = await aiTutorAPI.generateExplanation(
          courseId,
          courseTitle,
          content,
          learnerProfile
        )
        setData(result)
        return result
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 🎧 Generate Audio
  const generateAudio = useCallback(
    async (text, language = 'en', speed = 1.0) => {
      setLoading(true)
      setError(null)
      try {
        const result = await aiTutorAPI.generateAudio(text, language, speed)
        setData(result)
        return result
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 🎬 Generate Video
  const generateVideo = useCallback(
    async (text, avatar = 'student', duration = null) => {
      setLoading(true)
      setError(null)
      try {
        const result = await aiTutorAPI.generateVideo(text, avatar, duration)
        setData(result)
        return result
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // 🎯 Generate Quiz
  const generateQuiz = useCallback(
    async (content, difficulty = 'medium', numQuestions = 5) => {
      setLoading(true)
      setError(null)
      try {
        const result = await aiTutorAPI.generateQuiz(content, difficulty, numQuestions)
        setData(result)
        return result
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    loading,
    error,
    data,
    generateExplanation,
    generateAudio,
    generateVideo,
    generateQuiz,
  }
}
