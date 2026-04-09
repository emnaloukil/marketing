require('dotenv').config()
const cron = require('node-cron')
const mongoose = require('mongoose')
const Student = require('../models/Student')
const DailySummary = require('../models/DailySummary')
const connectDB = require('../config/db')
const { getDailySummary } = require('../services/dailySummaryService')

function mapDayTrend(avgScore) {
  if (avgScore === null || avgScore === undefined) return null
  if (avgScore >= 65) return 'good'
  if (avgScore >= 40) return 'moderate'
  return 'struggling'
}

function buildSessionDocuments(summarySessions = []) {
  return summarySessions.map((s) => ({
    sessionId: s.sessionId,
    subject: s.subject || s.title || null,
    startedAt: s.startedAt ? new Date(s.startedAt) : null,
    endedAt: s.endedAt ? new Date(s.endedAt) : null,
    engagementScore: s.engagementScore ?? s.score ?? null,
    trend: s.trend || null,
  }))
}

async function runDailySummaryJob(dateOverride) {
  const startedAt = Date.now()
  const targetDate = dateOverride || new Date().toISOString().split('T')[0]

  console.log('╔══════════════════════════════════════════════════╗')
  console.log(`║  DailySummary Job — ${targetDate}                ║`)
  console.log('╚══════════════════════════════════════════════════╝')

  const report = {
    date: targetDate,
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
      const summary = await getDailySummary(sid, targetDate)

      if (!summary.hasData) {
        console.log(`[Job] ⏭  ${sName} — aucune session ce jour`)
        report.skipped++
        continue
      }

      const totalCounts = summary.buttonTotals || {
        understand: 0,
        confused: 0,
        overwhelmed: 0,
        help: 0,
      }

      const totalPresses = Object.values(totalCounts).reduce((a, b) => a + b, 0)

      await DailySummary.findOneAndUpdate(
        {
          studentId: student._id,
          date: targetDate,
        },
        {
          studentId: student._id,
          parentId: student.parent || null,
          date: targetDate,

          avgEngagementScore: summary.avgScore,
          dayTrend: mapDayTrend(summary.avgScore),
          totalSessions: summary.totalSessions || 0,

          sessions: buildSessionDocuments(summary.sessions),

          totalCounts,
          totalPresses,

          parentAdvice: summary.eveningAdvice,
          status: 'ready',
          generatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      )

      console.log(
        `[Job] ✅  ${sName} — score: ${summary.avgScore} | stored trend: ${mapDayTrend(summary.avgScore)}`
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
  console.log(`[Job] ⏭  ${report.skipped} sans session`)
  console.log(`[Job] ❌ ${report.failed} en erreur`)
  if (report.errors.length > 0) {
    console.log('[Job] Erreurs détaillées :')
    report.errors.forEach(e => console.log(`   → ${e.studentName} : ${e.error}`))
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
    .then(report => {
      console.log('\nRapport final :')
      console.log(JSON.stringify(report, null, 2))
      return mongoose.disconnect()
    })
    .then(() => {
      console.log('Connexion fermée')
      process.exit(0)
    })
    .catch(err => {
      console.error('Erreur fatale :', err)
      process.exit(1)
    })
}

module.exports = {
  scheduleDailySummaryJob,
  runDailySummaryJob,
}