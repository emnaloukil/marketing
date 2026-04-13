// classController.js
const Class = require('../models/Class')

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/classes
// Crée une nouvelle classe pour un teacher.
// teacherId vient du body pour le MVP.
// ─────────────────────────────────────────────────────────────────────────────
async function createClass(req, res) {
  try {
    const { teacherId, name} = req.body

    // Validation
    if (!teacherId || !teacherId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'teacherId est requis',
      })
    }
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'name est requis',
      })
    }

    // Vérifier doublon
    const existing = await Class.findOne({
      teacherId,
      name: name.trim(),
    }).lean()

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Vous avez déjà une classe nommée "${name.trim()}"`,
      })
    }

    const newClass = await Class.create({
      teacherId,
      name:    name.trim(),
    })

    res.status(201).json({
      success: true,
      message: 'Classe créée',
      data:    newClass,
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Une classe avec ce nom existe déjà pour ce teacher',
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classes/teacher/:teacherId
// Récupère toutes les classes d'un teacher.
// ─────────────────────────────────────────────────────────────────────────────
async function getClassesByTeacher(req, res) {
  try {
    const { teacherId } = req.params

    const classes = await Class.find({ teacherId })
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      count:   classes.length,
      data:    classes,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/classes/:id
// Récupère une classe par son ID.
// ─────────────────────────────────────────────────────────────────────────────
async function getClassById(req, res) {
  try {
    const cls = await Class.findById(req.params.id).lean()

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Classe introuvable',
      })
    }

    res.json({ success: true, data: cls })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/classes/:id
// Met à jour une classe.
// ─────────────────────────────────────────────────────────────────────────────
async function updateClass(req, res) {
  try {
    const { name} = req.body
    const updates = {}

    if (name    !== undefined) updates.name    = name.trim()

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour',
      })
    }

    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Classe introuvable' })
    }

    res.json({ success: true, message: 'Classe mise à jour', data: cls })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Une classe avec ce nom existe déjà',
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/classes/:id
// Supprime une classe.
// ─────────────────────────────────────────────────────────────────────────────
async function deleteClass(req, res) {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id)

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Classe introuvable' })
    }

    res.json({
      success: true,
      message: `Classe "${cls.name}" supprimée`,
      data:    { id: cls._id },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  createClass,
  getClassesByTeacher,
  getClassById,
  updateClass,
  deleteClass,
}