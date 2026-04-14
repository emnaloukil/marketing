const express = require('express')
const router  = express.Router()
const { getMaterials, addMaterial, deleteMaterial } = require('../controllers/materialController')

router.get('/',      getMaterials)
router.post('/',     addMaterial)
router.delete('/:id', deleteMaterial)

module.exports = router