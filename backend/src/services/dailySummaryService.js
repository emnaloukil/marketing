const ClassSession = require('../models/Classsession')
const ButtonEvent = require('../models/Buttonevent')
const Student = require('../models/Student')
const { calcScore, detectTrend, getAvgScore } = require('./engagementEngine')

const STATUS_LABELS = {
  good: 'Good day 🌟',
  moderate: 'Moderate day 🙂',
  difficult: 'Difficult day 💛',
}

const INSIGHTS = {
  improving: (name) =>
    `${name} started the day slowly but picked up well — their engagement improved as the day went on.`,

  stable_good: (name) =>
    `${name} had a great day overall. They stayed focused and engaged throughout most of their sessions.`,

  stable_bad: (name) =>
    `${name} seemed to have a harder time staying engaged today. This can happen — rest and a calm evening can help.`,

  degrading: (name) =>
    `${name} started well but found the afternoon more challenging. They may need some downtime this evening.`,

  recovering: (name) =>
    `${name} had some ups and downs today but showed good resilience. Overall a positive effort.`,

  neutral: (name) =>
    `${name} had a fairly typical day. Not enough data yet to spot a clear pattern.`,
}

const EVENING_ADVICE = {
  improving: 'Keep up the positive momentum — a short review of today\'s topics could reinforce what they learned.',
  stable_good: 'A great day! No pressure tonight — free time and rest are just as important.',
  stable_bad: 'Try a calm, screen-free evening. A light snack and some downtime can work wonders.',
  degrading: 'Avoid homework pressure tonight. A walk, a meal together, and early bed will do more good.',
  recovering: 'A relaxed evening with a little reading or a quiet activity would be perfect.',
  neutral: 'Just check in with them — a simple "how was your day?" goes a long way.',
}

const ALERT_RULES = [
  {
    key: 'high_overwhelmed',
    check: (totals) => totals.overwhelmed >= 5,
    message: (name) => `${name} pressed "overwhelmed" several times today — they may need extra support.`,
    severity: 'warning',
  },
  {
    key: 'high_help',
    check: (totals) => totals.help >= 4,
    message: (name) => `${name} asked for help frequently today. Worth asking them if anything felt too hard.`,
    severity: 'info',
  },
  {
    key: 'low_understand',
    check: (totals, sessionCount) => sessionCount >= 2 && totals.understand === 0,
    message: (name) => `${name} didn't press "understand" at all today — they might have been lost or disengaged.`,
    severity: 'warning',
  },
  {
    key: 'very_engaged',
    check: (totals) => totals.understand >= 8 && totals.confused <= 1,
    message: (name) => `${name} was very engaged today — lots of "understand" signals. Great session!`,
    severity: 'positive',
  },
]

function buildCounts(events) {
  const counts = { understand: 0, confused: 0, overwhelmed: 0, help: 0 }

  for (const e of events) {
    if (counts[e.buttonType] !== undefined) {
      counts[e.buttonType]++
    }
  }

  return counts
}

function getStatusLabel(avgScore) {
  if (avgScore === null) return null
  if (avgScore >= 65) return STATUS_LABELS.good
  if (avgScore >= 40) return STATUS_LABELS.moderate
  return STATUS_LABELS.difficult
}

function buildAlerts(totals, firstName, sessionCount) {
  return ALERT_RULES
    .filter(rule => rule.check(totals, sessionCount))
    .map(rule => ({
      key: rule.key,
      severity: rule.severity,
      message: rule.message(firstName),
    }))
}

function getDayRange(date) {
  const d = date ? new Date(date) : new Date()

  if (isNaN(d.getTime())) {
    throw new Error('Date invalide. Format attendu : YYYY-MM-DD')
  }

  const start = new Date(d)
  start.setHours(0, 0, 0, 0)

  const end = new Date(d)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

async function getDailySummary(studentId, date) {
  const student = await Student.findById(studentId).lean()
  if (!student) throw new Error(`Élève introuvable : ${studentId}`)

  const firstName = student.firstName
  const { start, end } = getDayRange(date)

  const sessions = await ClassSession.find({
    classId: student.classId,
    startedAt: { $gte: start, $lte: end },
    status: { $in: ['ended', 'active'] },
  })
    .sort({ startedAt: 1 })
    .lean()

  if (sessions.length === 0) {
    return {
      studentId,
      studentName: `${firstName} ${student.lastName}`,
      date: start.toISOString().split('T')[0],
      hasData: false,
      message: `No sessions recorded for ${firstName} on this day.`,
      sessions: [],
      buttonTotals: { understand: 0, confused: 0, overwhelmed: 0, help: 0 },
      avgScore: null,
      dayTrend: null,
      statusLabel: null,
      insight: null,
      eveningAdvice: null,
      alerts: [],
    }
  }

  const sessionIds = sessions.map(s => s._id)

  const allEvents = await ButtonEvent.find({
    studentId,
    sessionId: { $in: sessionIds },
  }).lean()

  const eventsBySession = {}
  for (const event of allEvents) {
    const sid = event.sessionId.toString()
    if (!eventsBySession[sid]) eventsBySession[sid] = []
    eventsBySession[sid].push(event)
  }

  const sessionScores = []

  const sessionDetails = sessions.map(session => {
    const sid = session._id.toString()
    const events = eventsBySession[sid] || []
    const counts = buildCounts(events)
    const score = calcScore(counts)

    if (score !== null) {
      sessionScores.push(score)
    }

    const sessionStatus =
      score === null ? 'No data yet ⚪'
      : score >= 65 ? 'Going well 🟢'
      : score >= 40 ? 'Some difficulties 🟡'
      : 'Struggling 🔴'

    return {
      sessionId: sid,
      subject: session.subject || null,
      startedAt: session.startedAt || null,
      endedAt: session.endedAt || null,
      status: session.status,
      engagementScore: score,
      trend: null,

      sessionStatus,
      counts,
      totalEvents: events.length,
    }
  })

  const buttonTotals = { understand: 0, confused: 0, overwhelmed: 0, help: 0 }
  for (const detail of sessionDetails) {
    for (const key of Object.keys(buttonTotals)) {
      buttonTotals[key] += detail.counts[key]
    }
  }

  const avgScore = sessionScores.length > 0 ? getAvgScore(sessionScores) : null
  const dayTrend = sessionScores.length > 0 ? detectTrend(sessionScores) : null
  const statusLabel = getStatusLabel(avgScore)

  const insightFn = INSIGHTS[dayTrend] || INSIGHTS.neutral
  const adviceFn = EVENING_ADVICE[dayTrend] || EVENING_ADVICE.neutral
  const insight = typeof insightFn === 'function' ? insightFn(firstName) : insightFn
  const eveningAdvice = typeof adviceFn === 'string' ? adviceFn : adviceFn

  const alerts = buildAlerts(buttonTotals, firstName, sessions.length)

  return {
    studentId,
    studentName: `${firstName} ${student.lastName}`,
    supportProfile: student.supportProfile,
    date: start.toISOString().split('T')[0],
    hasData: true,
    avgScore,
    dayTrend,
    statusLabel,
    insight,
    eveningAdvice,
    alerts,
    sessions: sessionDetails,
    buttonTotals,
    totalSessions: sessions.length,
    totalEvents: allEvents.length,
  }
}

async function getChildrenByParent(parentId) {
  const children = await Student.find({
    parent: parentId,
  })
    .sort({ firstName: 1 })
    .lean()

  if (children.length === 0) {
    throw new Error(`Aucun enfant trouvé pour ce parent : ${parentId}`)
  }

  return children
}

module.exports = {
  getDailySummary,
  getChildrenByParent,
}