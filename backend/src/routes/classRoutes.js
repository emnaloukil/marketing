// classRoutes.js
const express = require('express')
const router  = express.Router()
const {
  createClass,
  getClassesByTeacher,
  getClassById,
  updateClass,
  deleteClass,
} = require('../controllers/classController')

// ⚠️  Ordre : /teacher/:teacherId AVANT /:id
router.get('/teacher/:teacherId', getClassesByTeacher)
router.get('/:id',               getClassById)
router.post('/',                 createClass)
router.patch('/:id',             updateClass)
router.delete('/:id',            deleteClass)

module.exports = router