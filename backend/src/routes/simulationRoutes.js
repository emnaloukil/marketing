// simulationRoutes.js

const express    = require('express')
const router     = express.Router()
const ctrl       = require('../controllers/simulationController')

router.post('/start',  ctrl.start)
router.post('/stop',   ctrl.stop)
router.post('/press',  ctrl.press)
router.get('/active',  ctrl.active)   // bonus debug

module.exports = router