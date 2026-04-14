const express = require('express')
const router = express.Router()

const {
  createMaterial,
  getMaterialsByClass,
  getMaterialsBySession,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/materialController')

// POST /api/materials
router.post('/', createMaterial)

// GET /api/materials/class/:classId
router.get('/class/:classId', getMaterialsByClass)

// GET /api/materials/session/:sessionId
router.get('/session/:sessionId', getMaterialsBySession)

// GET /api/materials/:id
router.get('/:id', getMaterialById)

// PUT /api/materials/:id
router.put('/:id', updateMaterial)

// DELETE /api/materials/:id
router.delete('/:id', deleteMaterial)

module.exports = router