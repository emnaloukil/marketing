// jobController.js
// Permet de déclencher le job manuellement pour les tests.
// En production, cette route devrait être protégée par une auth admin.

const { runDailySummaryJob } = require('../jobs/generateDailySummaries')

/**
 * POST /api/jobs/daily-summaries
 * Déclenche la génération immédiate des résumés.
 *
 * Body optionnel : { date: "2024-01-15" }
 * → si absent, utilise aujourd'hui
 */
async function triggerDailySummaries(req, res) {
  try {
    const { date } = req.body   // optionnel

    console.log('[Job] Déclenchement manuel via API')

    // On répond immédiatement que le job a démarré
    // (ne pas attendre la fin si beaucoup d'élèves)
    res.status(202).json({
      success: true,
      message: 'Job démarré',
      targetDate: date || new Date().toISOString().split('T')[0],
    })

    // On lance le job après avoir répondu
    const report = await runDailySummaryJob(date)
    console.log('[Job] Manuel terminé :', report)

  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/jobs/daily-summaries/sync
 * Même chose mais attend la fin du job avant de répondre.
 * Utile pour les tests où on veut voir le rapport complet.
 */
async function triggerDailySummariesSync(req, res) {
  try {
    const { date } = req.body

    console.log('[Job] Déclenchement manuel synchrone via API')
    const report = await runDailySummaryJob(date)

    res.json({ success: true, data: report })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { triggerDailySummaries, triggerDailySummariesSync }