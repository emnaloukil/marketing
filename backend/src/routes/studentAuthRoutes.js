const express = require('express')
const router  = express.Router()
const ctrl    = require('../controllers/studentAuthController')

router.post('/login',             ctrl.login)
router.get('/profile/:studentId', ctrl.profile)

module.exports = router