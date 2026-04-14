require('dotenv').config()
const cron = require('node-cron')
const mongoose = require('mongoose')

const Student = require('../models/Student')
const DailySummary = require('../models/DailySummary')
const ClassSession = require('../models/Classsession')
const ButtonEvent = require('../models/Buttonevent')

const connectDB = require('../config/db')
const { calcScore, detectTrend, getAvgScore } = require('../services/engagementEngine')

const EVENING_ADVICE = {
  good: 'A great day overall. Encourage rest, confidence, and a short positive discussion about what went well.',
  moderate: 'A mixed day. A calm check-in tonight and a little encouragement can help consolidate learning.',
  struggling: 'Today seemed more difficult. Keep the evening calm and reassuring, without pressure.',
}

function isYYYYMMDD(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function getDayRange(dateOverride) {
  let year
  let month
  let day

  if (!dateOverride) {
    const now = new Date()
    year = now.getFullYear()
    month = now.getMonth()
    day = now.getDate()
  } else if (isYYYYMMDD(dateOverride)) {
    const [y, m, d] = dateOverride.split('-').map(Number)
    year = y
    month = m - 1
    day = d
  } else {
    const parsed = new Date(dateOverride)
    if (isNaN(parsed.getTime())) {
      throw new Error('Date invalide. Format attendu : YYYY-MM-DD')
    }
    year = parsed.getFullYear()
    month = parsed.getMonth()
    day = parsed.getDate()
  }

  const start = new Date(year, month, day, 0, 0, 0, 0)
  const end = new Date(year, month, day, 23, 59, 59, 999)

  const yyyy = String(year)
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  const date = `${yyyy}-${mm}-${dd}`

  return { start, end, date }
}

function buildCounts(events) {
  const counts = {
    understand: 0,
    confused: 0,
    overwhelmed: 0,
    help: 0,
  }

  for (const event of events) {
    if (counts[event.buttonType] !== undefined) {
      counts[event.buttonType]++
    }
  }

  return counts
}

function mapDayTrend(avgScore) {
  if (avgScore === null || avgScore === undefined) return null
  if (avgScore >= 65) return 'good'
  if (avgScore >= 40) return 'moderate'
  return 'struggling'
}

function buildParentAdvice(dayTrend) {
  return EVENING_ADVICE[dayTrend] || null
}

async function generateDailySummaryForStudent(student, targetDate) {
  const { start, end, date } = getDayRange(targetDate)

  const events = await ButtonEvent.find({
    studentId: student._id,
    timestamp: { $gte: start, $lte: end },
  }).lean()

  if (!events.length) {
    return {
      created: false,
      skipped: true,
      reason: 'no_events',
      studentId: student._id.toString(),
      studentName: `${student.firstName} ${student.lastName}`,
    }
  }

  const uniqueSessionIds = [...new Set(events.map((e) => String(e.sessionId)))]

  const sessions = await ClassSession.find({
    _id: { $in: uniqueSessionIds },
  })
    .sort({ startedAt: 1 })
    .lean()

  const eventsBySession = {}
  for (const event of events) {
    const sid = String(event.sessionId)
    if (!eventsBySession[sid]) eventsBySession[sid] = []
    eventsBySession[sid].push(event)
  }

  const sessionScores = []
  const totalCounts = {
    understand: 0,
    confused: 0,
    overwhelmed: 0,
    help: 0,
  }

  const rawSessionDocs = sessions.map((session) => {
    const sid = String(session._id)
    const sessionEvents = eventsBySession[sid] || []
    const counts = buildCounts(sessionEvents)
    const engagementScore = calcScore(counts)

    if (engagementScore !== null && engagementScore !== undefined) {
      sessionScores.push(engagementScore)
    }

    totalCounts.understand += counts.understand
    totalCounts.confused += counts.confused
    totalCounts.overwhelmed += counts.overwhelmed
    totalCounts.help += counts.help

    return {
      sessionId: session._id,
      subject: session.subject || null,
      startedAt: session.startedAt || null,
      endedAt: session.endedAt || null,
      engagementScore: engagementScore ?? null,
    }
  })

  const avgEngagementScore =
    sessionScores.length > 0 ? getAvgScore(sessionScores) : null

  const rawTrend =
    sessionScores.length > 0 ? detectTrend(sessionScores) : null

  const totalPresses = Object.values(totalCounts).reduce((a, b) => a + b, 0)
  const dayTrend = mapDayTrend(avgEngagementScore)

  const sessionDocs = rawSessionDocs.map((s, index) => ({
    ...s,
    trend: index === rawSessionDocs.length - 1 ? rawTrend : null,
  }))

  await DailySummary.findOneAndUpdate(
    {
      studentId: student._id,
      date,
    },
    {
      studentId: student._id,
      parentId: student.parent,
      date,
      avgEngagementScore,
      dayTrend,
      totalSessions: sessionDocs.length,
      sessions: sessionDocs,
      totalCounts,
      totalPresses,
      parentAdvice: buildParentAdvice(dayTrend),
      status: 'ready',
      generatedAt: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  )

  return {
    created: true,
    skipped: false,
    studentId: student._id.toString(),
    studentName: `${student.firstName} ${student.lastName}`,
    totalSessions: sessionDocs.length,
    totalPresses,
    avgEngagementScore,
    dayTrend,
  }
}

async function runDailySummaryJob(dateOverride) {
  const startedAt = Date.now()
  const { date } = getDayRange(dateOverride)

  console.log('╔══════════════════════════════════════════════════╗')
  console.log(`║  DailySummary Job — ${date}                ║`)
  console.log('╚══════════════════════════════════════════════════╝')

  const report = {
    date,
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    startedAt: new Date(startedAt),
    endedAt: null,
    duration: null,
  }

  const students = await Student.find({}).lean()
  report.total = students.length

  console.log(`[Job] ${students.length} élève(s) à traiter`)

  for (const student of students) {
    const sid = student._id.toString()
    const sName = `${student.firstName} ${student.lastName}`

    try {
      const result = await generateDailySummaryForStudent(student, date)

      if (result.skipped) {
        console.log(`[Job] ⏭  ${sName} — aucun event ce jour`)
        report.skipped++
        continue
      }

      console.log(
        `[Job] ✅  ${sName} — score: ${result.avgEngagementScore} | trend: ${result.dayTrend}`
      )
      report.success++
    } catch (err) {
      console.error(`[Job] ❌  ${sName} — ${err.message}`)
      report.failed++
      report.errors.push({
        studentId: sid,
        studentName: sName,
        error: err.message,
      })
    }
  }

  report.endedAt = new Date()
  report.duration = `${((Date.now() - startedAt) / 1000).toFixed(2)}s`

  console.log('──────────────────────────────────────────────────')
  console.log(`[Job] Terminé en ${report.duration}`)
  console.log(`[Job] ✅ ${report.success} générés`)
  console.log(`[Job] ⏭  ${report.skipped} sans événement`)
  console.log(`[Job] ❌ ${report.failed} en erreur`)
  if (report.errors.length > 0) {
    console.log('[Job] Erreurs détaillées :')
    report.errors.forEach((e) =>
      console.log(`   → ${e.studentName} : ${e.error}`)
    )
  }
  console.log('══════════════════════════════════════════════════')

  return report
}

function scheduleDailySummaryJob() {
  const SCHEDULE = '0 21 * * *'

  const task = cron.schedule(
    SCHEDULE,
    async () => {
      console.log('\n[Cron] Déclenchement DailySummary Job — 21h00')
      try {
        await runDailySummaryJob()
      } catch (err) {
        console.error('[Cron] Erreur fatale du job :', err.message)
      }
    },
    {
      timezone: 'Europe/Paris',
    }
  )

  console.log(`[Cron] DailySummary job planifié — ${SCHEDULE} (Europe/Paris)`)
  return task
}

if (require.main === module) {
  const dateArg = process.argv[2]

  connectDB()
    .then(() => {
      console.log('Connexion MongoDB OK')
      return runDailySummaryJob(dateArg)
    })
    .then((report) => {
      console.log('\nRapport final :')
      console.log(JSON.stringify(report, null, 2))
      return mongoose.disconnect()
    })
    .then(() => {
      console.log('Connexion fermée')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Erreur fatale :', err)
      process.exit(1)
    })
}

module.exports = {
  scheduleDailySummaryJob,
  runDailySummaryJob,
  generateDailySummaryForStudent,
}