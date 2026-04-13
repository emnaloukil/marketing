// sessionRoutes.js
// ⚠️  Ordre critique :
// /active/:classId   → avant /:id  (sinon "active" est lu comme un id)
// /teacher/:teacherId → avant /:id  (même raison)

const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/sessionController')

router.post('/',                      ctrl.start)         // POST /api/sessions/start → maintenant POST /api/sessions
router.post('/start',                 ctrl.start)         // garde les deux pour compatibilité
router.get('/active/:classId',        ctrl.getActive)     // ← avant /:id
router.get('/teacher/:teacherId',     ctrl.getByTeacher)  // ← avant /:id
router.get('/:id',                    ctrl.getById)
router.post('/:id/end',               ctrl.end)

module.exports = router