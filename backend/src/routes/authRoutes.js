// authRoutes.js

const express = require('express')
const router  = express.Router()
const {
  teacherRegister,
  teacherLogin,
  parentRegister,
  parentLogin,
} = require('../controllers/authController')

// Teacher
router.post('/teacher/register', teacherRegister)
router.post('/teacher/login',    teacherLogin)

// Parent
router.post('/parent/register',  parentRegister)
router.post('/parent/login',     parentLogin)

module.exports = router