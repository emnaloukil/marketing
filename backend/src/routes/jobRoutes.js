const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/jobController')

// Async : répond immédiatement, job tourne en arrière-plan
router.post('/daily-summaries',      ctrl.triggerDailySummaries)

// Sync : attend la fin du job, retourne le rapport complet
router.post('/daily-summaries/sync', ctrl.triggerDailySummariesSync)

module.exports = router