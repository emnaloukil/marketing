const { getDailySummary, getChildrenByParent } = require('../services/dailySummaryService')

async function dailySummary(req, res) {
  try {
    const { studentId } = req.params
    const { date, parentId } = req.query

    const summary = await getDailySummary(studentId, date, parentId)

    res.json({ success: true, data: summary })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ? 404 :
      err.message.includes('invalide') || err.message.includes('requis') ? 400 :
      500

    res.status(status).json({ success: false, message: err.message })
  }
}

async function children(req, res) {
  try {
    const kids = await getChildrenByParent(req.params.parentId)
    res.json({ success: true, count: kids.length, data: kids })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ||
      err.message.includes('Aucun') ||
      err.message.includes('requis')
        ? 404
        : 500

    res.status(status).json({ success: false, message: err.message })
  }
}

module.exports = { dailySummary, children }