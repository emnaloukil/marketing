const studentService = require('../services/studentService')

async function create(req, res) {
  try {
    const student = await studentService.createStudent(req.body)
    res.status(201).json({ success: true, message: 'Élève créé', data: student })
  } catch (err) {
    const status = err.message.includes('requis') || err.message.includes('invalide') ? 400 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

async function getAll(req, res) {
  try {
    const filters = {}

    if (req.query.supportProfile) {
      filters.supportProfile = req.query.supportProfile
    }

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === 'true'
    }

    const students = await studentService.getAllStudents(filters)
    res.json({ success: true, count: students.length, data: students })
  } catch (err) {
    const status = err.message.includes('invalide') ? 400 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

async function getById(req, res) {
  try {
    const student = await studentService.getStudentById(req.params.id)
    res.json({ success: true, data: student })
  } catch (err) {
    const status = err.message.includes('introuvable') ? 404 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

async function getByClass(req, res) {
  try {
    const students = await studentService.getStudentsByClass(req.params.classId)
    res.json({ success: true, count: students.length, data: students })
  } catch (err) {
    const status = err.message.includes('requis') ? 400 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

async function joinClassByCode(req, res) {
  try {
    const student = await studentService.joinClassByCode(
      req.params.id,
      req.body.classCode
    )

    const classroomData = await studentService.getStudentClassroom(req.params.id)

    res.json({
      success: true,
      message: 'Classe rejointe avec succès',
      data: {
        student,
        classroomData,
      },
    })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ? 404 :
      err.message.includes('requis') ? 400 :
      500

    res.status(status).json({
      success: false,
      message: err.message,
    })
  }
}

async function getClassroom(req, res) {
  try {
    const classroom = await studentService.getStudentClassroom(req.params.id)
    res.json({
      success: true,
      data: classroom,
    })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ? 404 :
      err.message.includes('requis') ? 400 :
      500

    res.status(status).json({
      success: false,
      message: err.message,
    })
  }
}

async function completeMaterial(req, res) {
  try {
    const result = await studentService.markMaterialComplete(
      req.params.id,
      req.params.materialId
    )

    res.json({
      success: true,
      message: 'Lecon marquee comme terminee',
      data: result,
    })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ? 404 :
      err.message.includes('requis') ? 400 :
      err.message.includes('ne fait pas partie') ? 403 :
      500

    res.status(status).json({
      success: false,
      message: err.message,
    })
  }
}

async function uncompleteMaterial(req, res) {
  try {
    const result = await studentService.markMaterialIncomplete(
      req.params.id,
      req.params.materialId
    )

    res.json({
      success: true,
      message: 'Lecon reouverte',
      data: result,
    })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ? 404 :
      err.message.includes('requis') ? 400 :
      500

    res.status(status).json({
      success: false,
      message: err.message,
    })
  }
}

async function update(req, res) {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body)
    res.json({ success: true, message: 'Élève mis à jour', data: student })
  } catch (err) {
    const status = err.message.includes('introuvable') ? 404
      : err.message.includes('invalide') ? 400
      : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

async function remove(req, res) {
  try {
    const student = await studentService.deleteStudent(req.params.id)
    res.json({ success: true, message: 'Élève désactivé', data: student })
  } catch (err) {
    const status = err.message.includes('introuvable') ? 404
      : err.message.includes('déjà désactivé') ? 409
      : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

module.exports = {
  create,
  getAll,
  getById,
  getByClass,
  joinClassByCode,
  getClassroom,
  completeMaterial,
  uncompleteMaterial,
  update,
  remove,
}
