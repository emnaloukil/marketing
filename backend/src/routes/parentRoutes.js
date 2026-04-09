// parentRoutes.js
// ⚠️  Ordre important : /children/:parentId avant /daily-summary/:studentId
// pour éviter toute ambiguïté de matching Express.

const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/parentController')

router.get('/children/:parentId',          ctrl.children)
router.get('/daily-summary/:studentId',    ctrl.dailySummary)

module.exports = router