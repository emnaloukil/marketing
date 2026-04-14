const DailySummary = require('../models/DailySummary')
const Student = require('../models/Student')

function normalizeDate(date) {
  if (!date) return new Date().toISOString().split('T')[0]

  const d = new Date(date)
  if (isNaN(d.getTime())) {
    throw new Error('Date invalide. Format attendu : YYYY-MM-DD')
  }

  return d.toISOString().split('T')[0]
}

function subjectLabel(subject) {
  const map = {
    mathematics: 'Mathematics',
    reading: 'Reading',
    sciences: 'Sciences',
  }
  return map[subject] || subject || 'Unknown'
}

function trendLabel(trend) {
  const map = {
    improving: 'Improving',
    stable_good: 'Stable (good)',
    stable_bad: 'Stable (low)',
    degrading: 'Degrading',
    recovering: 'Recovering',
    good: 'Good',
    moderate: 'Moderate',
    struggling: 'Struggling',
  }
  return map[trend] || trend || 'No trend'
}

async function getDailySummary(studentId, date, parentId = null) {
  if (!studentId) {
    throw new Error('studentId est requis')
  }

  const targetDate = normalizeDate(date)

  const student = await Student.findById(studentId).lean()
  if (!student) {
    throw new Error(`Élève introuvable : ${studentId}`)
  }

  const query = {
    studentId,
    date: targetDate,
  }

  if (parentId) {
    query.parentId = parentId
  }

  const summary = await DailySummary.findOne(query).lean()

  if (!summary) {
    return {
      hasData: false,
      studentId,
      studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      date: targetDate,
      status: 'pending',
      message: 'Le résumé du jour n’a pas encore été généré.',
      avgEngagementScore: null,
      dayTrend: null,
      totalSessions: 0,
      totalCounts: {
        understand: 0,
        confused: 0,
        overwhelmed: 0,
        help: 0,
      },
      totalPresses: 0,
      parentAdvice: null,
      sessions: [],
      generatedAt: null,
    }
  }

  return {
    hasData: true,
    studentId: summary.studentId,
    parentId: summary.parentId,
    studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
    supportProfile: student.supportProfile || 'none',
    date: summary.date,
    status: summary.status,
    avgEngagementScore: summary.avgEngagementScore,
    dayTrend: summary.dayTrend,
    totalSessions: summary.totalSessions,
    totalCounts: summary.totalCounts || {
      understand: 0,
      confused: 0,
      overwhelmed: 0,
      help: 0,
    },
    totalPresses: summary.totalPresses || 0,
    parentAdvice: summary.parentAdvice || null,
    generatedAt: summary.generatedAt || null,
    sessions: (summary.sessions || []).map((s) => ({
      sessionId: s.sessionId,
      subject: s.subject,
      subjectLabel: subjectLabel(s.subject),
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      engagementScore: s.engagementScore,
      trend: s.trend,
      trendLabel: trendLabel(s.trend),
    })),
  }
}

async function getChildrenByParent(parentId) {
  if (!parentId) {
    throw new Error('parentId est requis')
  }

  const children = await Student.find({ parent: parentId })
    .select('-pin')
    .sort({ firstName: 1, lastName: 1 })
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