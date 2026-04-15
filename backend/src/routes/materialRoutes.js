const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const router = express.Router()
const { getMaterials, addMaterial, deleteMaterial } = require('../controllers/materialController')

const uploadDir = path.join(__dirname, '..', 'uploads', 'materials')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, `${timestamp}_${safeName}`)
  },
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Seul le format PDF est accepté'), false)
    }
    cb(null, true)
  },
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
})

router.get('/', getMaterials)
router.post('/', upload.single('file'), addMaterial)
router.delete('/:id', deleteMaterial)

module.exports = router