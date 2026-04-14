const Material = require('../models/Material')

// GET /api/materials?classId=&subject=&teacherId=
async function getMaterials(req, res) {
  try {
    const { classId, subject, teacherId } = req.query
    if (!classId) return res.status(400).json({ success: false, message: 'classId requis' })

    const filter = { classId }
    if (subject)   filter.subject   = subject.toLowerCase()
    if (teacherId) filter.teacherId = teacherId

    const materials = await Material.find(filter).sort({ createdAt: -1 }).lean()
    res.json({ success: true, count: materials.length, data: materials })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/materials
async function addMaterial(req, res) {
  try {
    const { teacherId, classId, subject, title, fileUrl, sessionId, fileSize, mimeType } = req.body
    if (!teacherId || !classId || !subject || !title || !fileUrl) {
      return res.status(400).json({ success: false, message: 'teacherId, classId, subject, title et fileUrl sont requis' })
    }

    const material = await Material.create({
      teacherId, classId, subject: subject.toLowerCase(),
      title: title.trim(), fileUrl: fileUrl.trim(),
      sessionId: sessionId || null, fileSize: fileSize || null, mimeType: mimeType || null,
    })

    res.status(201).json({ success: true, message: 'Fichier ajouté', data: material })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/materials/:id
async function deleteMaterial(req, res) {
  try {
    const m = await Material.findByIdAndDelete(req.params.id)
    if (!m) return res.status(404).json({ success: false, message: 'Fichier introuvable' })
    res.json({ success: true, message: `"${m.title}" supprimé`, data: { id: m._id } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getMaterials, addMaterial, deleteMaterial }