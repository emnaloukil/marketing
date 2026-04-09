// studentController.js
// Rôle : lire req → appeler studentService → répondre avec res.json
// Aucune logique métier ici.

const studentService = require('../services/studentService')

/**
 * POST /api/students
 * Crée un nouvel élève.
 *
 * Body : { firstName, lastName, dateOfBirth, classId, supportProfile?, parent?, teacher? }
 */
async function create(req, res) {
  try {
    const student = await studentService.createStudent(req.body)
    res.status(201).json({ success: true, message: 'Élève créé', data: student })
  } catch (err) {
    const status = err.message.includes('requis') || err.message.includes('invalide') ? 400 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/students
 * Liste tous les élèves actifs.
 * Query params optionnels : ?supportProfile=adhd, ?isActive=false
 */
async function getAll(req, res) {
  try {
    const filters = {}

    if (req.query.supportProfile) {
      filters.supportProfile = req.query.supportProfile
    }
    if (req.query.isActive !== undefined) {
      // Le query param est une string — on le convertit en booléen
      filters.isActive = req.query.isActive === 'true'
    }

    const students = await studentService.getAllStudents(filters)
    res.json({ success: true, count: students.length, data: students })
  } catch (err) {
    const status = err.message.includes('invalide') ? 400 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/students/:id
 * Récupère un élève par son ID.
 */
async function getById(req, res) {
  try {
    const student = await studentService.getStudentById(req.params.id)
    res.json({ success: true, data: student })
  } catch (err) {
    const status = err.message.includes('introuvable') ? 404 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/students/class/:classId
 * Récupère tous les élèves actifs d'une classe.
 */
async function getByClass(req, res) {
  try {
    const students = await studentService.getStudentsByClass(req.params.classId)
    res.json({ success: true, count: students.length, data: students })
  } catch (err) {
    const status = err.message.includes('requis') ? 400 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * PATCH /api/students/:id
 * Met à jour partiellement un élève.
 * Body : seulement les champs à modifier
 */
async function update(req, res) {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body)
    res.json({ success: true, message: 'Élève mis à jour', data: student })
  } catch (err) {
    const status = err.message.includes('introuvable') ? 404
      : err.message.includes('invalide')  ? 400
      : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * DELETE /api/students/:id
 * Soft delete — passe isActive à false.
 * Les données historiques (ButtonEvents) sont conservées.
 */
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

module.exports = { create, getAll, getById, getByClass, update, remove }