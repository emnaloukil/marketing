const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/studentController')

// ordre important
router.get('/class/:classId', ctrl.getByClass)
router.get('/:id/classroom', ctrl.getClassroom)
router.post('/:id/materials/:materialId/complete', ctrl.completeMaterial)
router.delete('/:id/materials/:materialId/complete', ctrl.uncompleteMaterial)
router.get('/:id', ctrl.getById)

router.get('/', ctrl.getAll)
router.post('/', ctrl.create)
router.post('/:id/join-class', ctrl.joinClassByCode)
router.patch('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router
