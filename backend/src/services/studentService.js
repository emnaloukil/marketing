// studentService.js
// Rôle : toute la logique métier liée aux élèves.
// Le controller ne fait que lire req et appeler ces fonctions.

const Student = require('../models/Student')

// Valeurs autorisées — source unique de vérité
const VALID_SUPPORT_PROFILES = ['none', 'adhd', 'autism', 'dyslexia']

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valide les champs d'un élève à la création.
 * Lève une erreur explicite si quelque chose manque ou est invalide.
 */
function validateStudentData({ firstName, lastName, dateOfBirth, classId, supportProfile }) {
  if (!firstName || !firstName.trim()) throw new Error('firstName est requis')
  if (!lastName  || !lastName.trim())  throw new Error('lastName est requis')
  if (!classId   || !classId.trim())   throw new Error('classId est requis')
  if (!dateOfBirth)                    throw new Error('dateOfBirth est requis')

  const parsed = new Date(dateOfBirth)
  if (isNaN(parsed.getTime())) {
    throw new Error('dateOfBirth est invalide (format attendu : YYYY-MM-DD)')
  }

  if (supportProfile && !VALID_SUPPORT_PROFILES.includes(supportProfile)) {
    throw new Error(
      `supportProfile invalide : "${supportProfile}". Valeurs acceptées : ${VALID_SUPPORT_PROFILES.join(', ')}`
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée un nouvel élève.
 *
 * @param {Object} data - champs du formulaire
 * @returns {Document} élève créé
 */
async function createStudent(data) {
  const {
    firstName,
    lastName,
    dateOfBirth,
    classId,
    supportProfile = 'none',
    parent,
    teacher,
  } = data

  validateStudentData({ firstName, lastName, dateOfBirth, classId, supportProfile })

  const student = await Student.create({
    firstName:      firstName.trim(),
    lastName:       lastName.trim(),
    dateOfBirth:    new Date(dateOfBirth),
    classId:        classId.trim(),
    supportProfile,
    parent:         parent  || null,
    teacher:        teacher || null,
  })

  return student
}

/**
 * Récupère tous les élèves actifs.
 * Tri alphabétique par nom pour un affichage propre.
 *
 * @param {Object} filters - filtres optionnels ( supportProfile)
 * @returns {Document[]}
 */
async function getAllStudents(filters = {}) {
  const query = {}

  if (filters.supportProfile) {
    if (!VALID_SUPPORT_PROFILES.includes(filters.supportProfile)) {
      throw new Error(`supportProfile invalide : "${filters.supportProfile}"`)
    }
    query.supportProfile = filters.supportProfile
  }

  const students = await Student.find(query)
    .sort({ lastName: 1, firstName: 1 })
    .lean()

  return students
}

/**
 * Récupère un élève par son ID.
 * @param {string} id
 * @returns {Document}
 */
async function getStudentById(id) {
  const student = await Student.findById(id).lean()
  if (!student) throw new Error(`Élève introuvable : ${id}`)
  return student
}

/**
 * Récupère tous les élèves actifs d'une classe.
 * C'est l'endpoint le plus utilisé en pratique (dashboard teacher).
 *
 * @param {string} classId
 * @returns {Document[]}
 */
async function getStudentsByClass(classId) {
  if (!classId || !classId.trim()) throw new Error('classId est requis')

  const students = await Student.find({
    classId:  classId.trim(),
  })
    .sort({ lastName: 1, firstName: 1 })
    .lean()

  return students
}

/**
 * Met à jour partiellement un élève.
 * Seuls les champs fournis sont modifiés.
 *

 *
 * @param {string} id
 * @param {Object} updates
 * @returns {Document} élève mis à jour
 */
async function updateStudent(id, updates) {


  // Valider supportProfile si fourni
  if (updates.supportProfile && !VALID_SUPPORT_PROFILES.includes(updates.supportProfile)) {
    throw new Error(
      `supportProfile invalide : "${updates.supportProfile}". Valeurs acceptées : ${VALID_SUPPORT_PROFILES.join(', ')}`
    )
  }

  // Valider dateOfBirth si fournie
  if (updates.dateOfBirth) {
    const parsed = new Date(updates.dateOfBirth)
    if (isNaN(parsed.getTime())) {
      throw new Error('dateOfBirth est invalide (format attendu : YYYY-MM-DD)')
    }
    updates.dateOfBirth = parsed
  }

  // Trim les champs texte si présents
  if (updates.firstName) updates.firstName = updates.firstName.trim()
  if (updates.lastName)  updates.lastName  = updates.lastName.trim()
  if (updates.classId)   updates.classId   = updates.classId.trim()

  const student = await Student.findByIdAndUpdate(
    id,
  { $set: updates },
  { 
    new: true, 
    runValidators: true, 
    context: 'query' 
  }
)

  if (!student) throw new Error(`Élève introuvable : ${id}`)
  return student
}

/**
 
 * On ne supprime jamais vraiment un élève — ses ButtonEvents doivent rester.
 *
 * @param {string} id
 * @returns {Document}
 */
async function deleteStudent(id) {
  const student = await Student.findById(id)
  if (!student) throw new Error(`Élève introuvable : ${id}`)
 

  await student.save()
  return student
}

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  getStudentsByClass,
  updateStudent,
  deleteStudent,
  VALID_SUPPORT_PROFILES,
}