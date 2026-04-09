// studentRoutes.js
// Déclare les URLs et branche chaque route sur son controller.
//
// ⚠️  IMPORTANT — ordre des routes :
// /class/:classId DOIT être déclaré AVANT /:id
// sinon Express lirait "class" comme un :id et retournerait un CastError Mongoose.

const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/studentController')

// ── Ordre important ──────────────────────────────────────────────────────────
router.get('/class/:classId', ctrl.getByClass)  // ← en premier, avant /:id
router.get('/:id',            ctrl.getById)
// ────────────────────────────────────────────────────────────────────────────

router.get('/',     ctrl.getAll)
router.post('/',    ctrl.create)
router.patch('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router