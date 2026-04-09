import { useEffect, useState } from 'react'

export const PARENTS = [
  { parentId: 'p1', parentName: 'Mr. Ben Ali',   children: ['s1', 's2'] },
  { parentId: 'p2', parentName: 'Mrs. Trabelsi', children: ['s3', 's5'] },
  { parentId: 'p3', parentName: 'Mr. Mansouri',  children: ['s4'] },
  { parentId: 'p4', parentName: 'Mrs. Chaabane', children: ['s6'] },
]

const STUDENTS = [
  { studentId: 's1', studentName: 'Amine',   parentId: 'p1' },
  { studentId: 's2', studentName: 'Sara',    parentId: 'p1' },
  { studentId: 's3', studentName: 'Youssef', parentId: 'p2' },
  { studentId: 's4', studentName: 'Lina',    parentId: 'p3' },
  { studentId: 's5', studentName: 'Omar',    parentId: 'p2' },
  { studentId: 's6', studentName: 'Nour',    parentId: 'p4' },
]

// Pre-filled day sessions per student
const DAY_SESSIONS = {
  s1: [
    { subject: 'Mathematics', score: 45, time: '08:30' },
    { subject: 'Reading',     score: 62, time: '10:00' },
    { subject: 'Sciences',    score: 70, time: '14:00' },
  ],
  s2: [
    { subject: 'Mathematics', score: 80, time: '08:30' },
    { subject: 'Reading',     score: 75, time: '10:00' },
    { subject: 'Sciences',    score: 85, time: '14:00' },
  ],
  s3: [
    { subject: 'Mathematics', score: 30, time: '08:30' },
    { subject: 'Reading',     score: 35, time: '10:00' },
    { subject: 'Sciences',    score: 40, time: '14:00' },
  ],
  s4: [
    { subject: 'Mathematics', score: 90, time: '08:30' },
    { subject: 'Reading',     score: 88, time: '10:00' },
    { subject: 'Sciences',    score: 92, time: '14:00' },
  ],
  s5: [
    { subject: 'Mathematics', score: 55, time: '08:30' },
    { subject: 'Reading',     score: 60, time: '10:00' },
    { subject: 'Sciences',    score: 58, time: '14:00' },
  ],
  s6: [
    { subject: 'Mathematics', score: 72, time: '08:30' },
    { subject: 'Reading',     score: 68, time: '10:00' },
    { subject: 'Sciences',    score: 78, time: '14:00' },
  ],
}

// Pre-filled button counts per student
const INITIAL_COUNTS = {
  s1: { understand: 5, confused: 8, overwhelmed: 3, help: 4 },
  s2: { understand: 12, confused: 3, overwhelmed: 1, help: 1 },
  s3: { understand: 2, confused: 10, overwhelmed: 6, help: 7 },
  s4: { understand: 15, confused: 2, overwhelmed: 0, help: 1 },
  s5: { understand: 8, confused: 6, overwhelmed: 2, help: 3 },
  s6: { understand: 10, confused: 4, overwhelmed: 1, help: 2 },
}

const WEIGHTS   = { understand: 2, confused: -1, overwhelmed: -3, help: -2 }
const PROFILES  = {
  s1: ['understand', 'understand', 'confused', 'confused', 'overwhelmed'],
  s2: ['understand', 'understand', 'understand', 'confused'],
  s3: ['confused', 'confused', 'help', 'overwhelmed', 'overwhelmed'],
  s4: ['understand', 'understand', 'understand', 'understand', 'confused'],
  s5: ['understand', 'confused', 'help', 'overwhelmed'],
  s6: ['understand', 'understand', 'understand', 'confused', 'help'],
}

const RECOMMENDATIONS = {
  improving:   [
    { type: 'pedagogique',   message: 'The class is improving — maintain the current pace and consider a slight difficulty increase.' },
    { type: 'encouragement', message: 'Celebrate the class progress openly — positive reinforcement boosts group motivation.' }
  ],
  stable_good: [
    { type: 'pedagogique',   message: 'The class is consistently engaged. Keep the current approach — it is working well.' }
  ],
  stable_bad:  [
    { type: 'pedagogique',   message: 'Most students are stuck. Try a different teaching method or a more interactive activity.' },
    { type: 'approche',      message: 'Consider a group activity or peer learning — students helping each other can break the stagnation.' }
  ],
  degrading:   [
    { type: 'urgent',        message: 'The class is struggling. Stop the current activity and offer a short break immediately.' },
    { type: 'difficulte',    message: 'The content is too difficult. Reduce difficulty and restart with a simpler version.' },
    { type: 'emotionnelle',  message: 'Address the class collectively — normalize struggle and encourage students to keep trying.' }
  ],
  recovering:  [
    { type: 'pedagogique',   message: 'The class is recovering. Maintain reduced difficulty a bit longer before increasing again.' },
    { type: 'encouragement', message: 'Acknowledge the effort of the class — they pushed through a difficult moment together.' }
  ],
}

function calcScore(counts) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0)
  if (total === 0) return null
  const w = Object.entries(counts).reduce((s, [k, v]) => s + WEIGHTS[k] * v, 0)
  return Math.min(100, Math.max(0, Math.round(50 + (w / total) * 12)))
}

function detectTrend(history) {
  if (history.length < 4) return null
  const recent  = history.slice(-3)
  const earlier = history.slice(-6, -3)
  if (earlier.length === 0) return null
  const rAvg = recent.reduce((a, b) => a + b, 0)  / recent.length
  const eAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
  const diff = rAvg - eAvg
  if (diff > 4)   return 'improving'
  if (diff < -4)  return 'degrading'
  if (rAvg >= 55) return 'stable_good'
  if (rAvg < 42)  return 'stable_bad'
  return 'recovering'
}

function getDayTrend(sessions) {
  const scores = sessions.map(s => s.score).filter(s => s !== null)
  if (scores.length === 0) return null
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  if (avg >= 65) return 'good'
  if (avg >= 45) return 'moderate'
  return 'struggling'
}

function getAvgScore(sessions) {
  const scores = sessions.map(s => s.score).filter(s => s !== null)
  if (scores.length === 0) return null
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

const useSocket = () => {
  const [connected,     setConnected]     = useState(false)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    const connectTimer = setTimeout(() => setConnected(true), 500)

    // Initialize student states with pre-filled data
    const studentStates = STUDENTS.map(s => ({
      ...s,
      counts:       { ...INITIAL_COUNTS[s.studentId] },
      scoreHistory: [],
    }))

    const classScoreHistory = []

    function buildPayload() {
      const studentsData = studentStates.map(s => {
        const score    = calcScore(s.counts)
        const sessions = DAY_SESSIONS[s.studentId]
        return {
          sessionId:       `session_${s.studentId}`,
          studentId:       s.studentId,
          studentName:     s.studentName,
          parentId:        s.parentId,
          counts:          { ...s.counts },
          totalPresses:    Object.values(s.counts).reduce((a, b) => a + b, 0),
          engagementScore: score,
          trend:           detectTrend(s.scoreHistory),
          daySummary: {
            sessions,
            dayTrend: getDayTrend(sessions),
            avgScore: getAvgScore(sessions),
          }
        }
      })

      const scores = studentsData.map(s => s.engagementScore).filter(s => s !== null)
      const classScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null

      if (classScore !== null) classScoreHistory.push(classScore)

      const trend = detectTrend(classScoreHistory)

      return {
        classScore,
        classScoreHistory: [...classScoreHistory],
        trend,
        breakdown: {
          engaged:    scores.filter(s => s >= 65).length,
          struggling: scores.filter(s => s >= 40 && s < 65).length,
          distressed: scores.filter(s => s < 40).length,
          total:      scores.length
        },
        recommendations: trend ? RECOMMENDATIONS[trend] : [],
        students: studentsData,
        parents:  PARENTS,
      }
    }

    // Emit initial data immediately — no waiting
    setDashboardData(buildPayload())
    setConnected(true)

    // Continue simulating live button presses
    const pressInterval = setInterval(() => {
      const idx     = Math.floor(Math.random() * studentStates.length)
      const s       = studentStates[idx]
      const profile = PROFILES[s.studentId]
      const btn     = profile[Math.floor(Math.random() * profile.length)]
      s.counts[btn] += 1
      const score = calcScore(s.counts)
      if (score !== null) s.scoreHistory.push(score)
      setDashboardData(buildPayload())
    }, 1500)

    return () => {
      clearTimeout(connectTimer)
      clearInterval(pressInterval)
    }
  }, [])

  return { connected, dashboardData }
}

export default useSocket