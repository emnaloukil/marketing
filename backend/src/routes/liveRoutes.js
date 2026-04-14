const express = require('express')
const router  = express.Router()
const { startOrGet, getSnapshot, endSession, getActive } = require('../controllers/liveSessionController')

router.post('/start',                       startOrGet)
router.get('/session/:sessionId/snapshot',  getSnapshot)
router.post('/session/:sessionId/end',      endSession)
router.get('/teacher/:teacherId/active',    getActive)

module.exports = router