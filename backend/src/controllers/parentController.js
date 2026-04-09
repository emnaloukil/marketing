// parentController.js
// Rôle : lire req → appeler dailySummaryService → répondre.

const { getDailySummary, getChildrenByParent } = require('../services/dailySummaryService')

/**
 * GET /api/parent/daily-summary/:studentId?date=YYYY-MM-DD
 * Retourne le résumé journalier d'un élève pour son parent.
 *
 * Si date est absent → utilise aujourd'hui.
 */
async function dailySummary(req, res) {
  try {
    const { studentId } = req.params
    const { date }      = req.query   // optionnel : YYYY-MM-DD

    const summary = await getDailySummary(studentId, date)

    res.json({ success: true, data: summary })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ? 404 :
      err.message.includes('invalide')    ? 400 :
      500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/parent/children/:parentId
 * Retourne la liste des enfants d'un parent.
 */
async function children(req, res) {
  try {
    const kids = await getChildrenByParent(req.params.parentId)
    res.json({ success: true, count: kids.length, data: kids })
  } catch (err) {
    const status = err.message.includes('introuvable') || err.message.includes('Aucun') ? 404 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

module.exports = { dailySummary, children }