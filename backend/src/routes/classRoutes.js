const express = require('express')
const router = express.Router()

const {
  createClass,
  getClassesByTeacher,
  getClassByCode,
  getClassById,
  updateClass,
  deleteClass,
} = require('../controllers/classController')

// ordre important
router.get('/teacher/:teacherId', getClassesByTeacher)
router.get('/code/:classCode', getClassByCode)
router.get('/:id', getClassById)

router.post('/', createClass)
router.patch('/:id', updateClass)
router.delete('/:id', deleteClass)

module.exports = router