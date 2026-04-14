const Class = require('../models/Class')
const Teacher = require('../models/Teacher')

function generateClassCode(name = '') {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4) || 'CLAS'

  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${random}`
}

async function getUniqueClassCode(name) {
  let code = ''
  let exists = true

  while (exists) {
    code = generateClassCode(name)
    exists = await Class.findOne({ classCode: code }).lean()
  }

  return code
}

async function createClass(req, res) {
  try {
    const { teacherId, name } = req.body

    if (!teacherId || !String(teacherId).trim()) {
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

    const cleanName = name.trim()

    const existing = await Class.findOne({
      teacherId,
      name: cleanName,
    }).lean()

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Vous avez déjà une classe nommée "${cleanName}"`,
      })
    }

    const classCode = await getUniqueClassCode(cleanName)

    const newClass = await Class.create({
      teacherId,
      name: cleanName,
      classCode,
    })

    const teacher = await Teacher.findById(teacherId).lean()

    return res.status(201).json({
      success: true,
      message: 'Classe créée',
      data: {
        ...newClass.toObject(),
        teacherName: teacher
          ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
          : '',
      },
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Une classe avec ce nom ou ce code existe déjà',
      })
    }

    return res.status(500).json({ success: false, message: err.message })
  }
}

async function getClassesByTeacher(req, res) {
  try {
    const { teacherId } = req.params

    const teacher = await Teacher.findById(teacherId).lean()
    const teacherName = teacher
      ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
      : ''

    const classes = await Class.find({ teacherId })
      .sort({ createdAt: -1 })
      .lean()

    return res.json({
      success: true,
      count: classes.length,
      data: classes.map((cls) => ({
        ...cls,
        teacherName,
      })),
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

async function getClassById(req, res) {
  try {
    const cls = await Class.findById(req.params.id).lean()

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Classe introuvable',
      })
    }

    const teacher = await Teacher.findById(cls.teacherId).lean()

    return res.json({
      success: true,
      data: {
        ...cls,
        teacherName: teacher
          ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
          : '',
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

async function updateClass(req, res) {
  try {
    const { name } = req.body
    const updates = {}

    if (name !== undefined) updates.name = name.trim()

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
    ).lean()

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Classe introuvable',
      })
    }

    const teacher = await Teacher.findById(cls.teacherId).lean()

    return res.json({
      success: true,
      message: 'Classe mise à jour',
      data: {
        ...cls,
        teacherName: teacher
          ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim()
          : '',
      },
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Une classe avec ce nom existe déjà',
      })
    }

    return res.status(500).json({ success: false, message: err.message })
  }
}

async function deleteClass(req, res) {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id)

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Classe introuvable' })
    }

    return res.json({
      success: true,
      message: `Classe "${cls.name}" supprimée`,
      data: { id: cls._id },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  createClass,
  getClassesByTeacher,
  getClassById,
  updateClass,
  deleteClass,
}