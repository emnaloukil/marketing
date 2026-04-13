// parentChildRoutes.js
// ⚠️  Ordre critique :
// /detail/:studentId DOIT être avant /:studentId
// sinon Express lirait "detail" comme un studentId → CastError Mongoose

const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/parentChildController')

router.post('/',                    ctrl.addChild)        // Ajouter un enfant
router.get('/:parentId',            ctrl.getChildren)     // Lister les enfants d'un parent
router.get('/detail/:studentId',    ctrl.getChildDetail)  // Détail d'un enfant  ← avant /:studentId
router.put('/:studentId',           ctrl.updateChild)     // Modifier un enfant

module.exports = router