// studentAuthController.js
// Rôle : register, login et profile pour l'enfant.
// Pas d'activation parent nécessaire — l'enfant s'inscrit directement.

const jwt     = require('jsonwebtoken')
const Student = require('../models/Student')
const ClassSession = require('../models/Classsession')

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère un studentCode unique lisible.
 * Format : STU-XXXX (lettres + chiffres sans ambiguïté visuelle)
 * Vérifie l'unicité en base avant de retourner.
 */
async function generateUniqueStudentCode() {
  // On exclut I, O, 0, 1 pour éviter les confusions visuelles
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  let code
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 10) {
    const suffix = Array.from({ length: 4 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('')

    code = `STU-${suffix}`

    const existing = await Student.findOne({ studentCode: code }).lean()
    if (!existing) isUnique = true
    attempts++
  }

  if (!isUnique) throw new Error('Impossible de générer un studentCode unique')
  return code
}

/**
 * Valide qu'un PIN est bien 4 chiffres.
 */
function isValidPIN(pin) {
  return /^\d{4}$/.test(String(pin))
}

/**
 * Génère un token JWT avec role student.
 */
function generateToken(id) {
  return jwt.sign(
    { id, role: 'student' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * Formate la réponse sans pin.
 */
function buildStudentResponse(student) {
  return {
    id:             student._id,
    firstName:      student.firstName,
    lastName:       student.lastName,
    studentCode:    student.studentCode,
    classId:        student.classId,
    supportProfile: student.supportProfile,
    dateOfBirth:    student.dateOfBirth,
    parent:         student.parent,
    role:           'student',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/student-auth/register
 * L'enfant crée son compte avec ses infos de base + un PIN choisi.
 * Le studentCode est généré automatiquement.
 *
 * Body : {
 *   firstName, lastName, parentId, classId,
 *   supportProfile, dateOfBirth, pin
 * }
 */
async function register(req, res) {
  try {
    const {
      firstName,
      lastName,
      parentId,
      classId,
      supportProfile = 'none',
      dateOfBirth,
      pin,
    } = req.body

    // ── Validation ────────────────────────────────────────────────────────────
    if (!firstName)   return res.status(400).json({ success: false, message: 'firstName est requis' })
    if (!lastName)    return res.status(400).json({ success: false, message: 'lastName est requis' })
    if (!parentId)    return res.status(400).json({ success: false, message: 'parentId est requis' })
    if (!classId)     return res.status(400).json({ success: false, message: 'classId est requis' })
    if (!dateOfBirth) return res.status(400).json({ success: false, message: 'dateOfBirth est requise' })
    if (!pin)         return res.status(400).json({ success: false, message: 'pin est requis' })

    if (!isValidPIN(pin)) {
      return res.status(400).json({
        success: false,
        message: 'Le PIN doit contenir exactement 4 chiffres (ex: 1234)',
      })
    }

    // ── Générer un studentCode unique ─────────────────────────────────────────
    const studentCode = await generateUniqueStudentCode()

    // ── Créer l'élève ─────────────────────────────────────────────────────────
    // Le hook pre('save') hashera le PIN automatiquement
    const student = await Student.create({
      firstName:      firstName.trim(),
      lastName:       lastName.trim(),
      parent:         parentId,
      classId:        classId.trim(),
      supportProfile,
      dateOfBirth:    new Date(dateOfBirth),
      studentCode,
      pin:            String(pin),   // sera hashé par le hook
    })

    const token = generateToken(student._id.toString())

    res.status(201).json({
      success: true,
      message: `Compte créé pour ${student.firstName} !`,
      data: {
        token,
        studentCode,   // retourné en clair UNE SEULE FOIS — à noter
        student: buildStudentResponse(student),
      },
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Ce studentCode existe déjà — réessaie',
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/student-auth/login
 * L'enfant entre son studentCode + PIN.
 *
 * Body : { studentCode, pin }
 */
async function login(req, res) {
  try {
    const { studentCode, pin } = req.body

    // ── Validation ────────────────────────────────────────────────────────────
    if (!studentCode || !studentCode.trim()) {
      return res.status(400).json({ success: false, message: 'studentCode est requis' })
    }
    if (!pin) {
      return res.status(400).json({ success: false, message: 'pin est requis' })
    }

    // ── Chercher l'élève par studentCode ──────────────────────────────────────
    // .select('+pin') nécessaire car pin a select: false dans le schéma
    const student = await Student.findOne({
      studentCode: studentCode.trim().toUpperCase(),
    }).select('+pin')

    // Message volontairement vague — ne pas révéler si le code existe
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Code ou PIN incorrect',
      })
    }

    // ── Vérifier le PIN ───────────────────────────────────────────────────────
    const isMatch = await student.comparePIN(pin)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Code ou PIN incorrect',
      })
    }

    // ── Générer le token ──────────────────────────────────────────────────────
    const token = generateToken(student._id.toString())

    res.json({
      success: true,
      message: `Bonjour ${student.firstName} ! 👋`,
      data: {
        token,
        student: buildStudentResponse(student),
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE + DASHBOARD ENFANT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/student-auth/profile/:studentId
 * Retourne le profil de l'élève + la session active de sa classe si elle existe.
 * C'est ce que le dashboard enfant affiche.
 */
async function profile(req, res) {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('parent', 'firstName lastName email')
      .lean()

    if (!student) {
      return res.status(404).json({ success: false, message: 'Élève introuvable' })
    }

    // Chercher la session active de la classe de l'élève
    const activeSession = await ClassSession.findOne({
      classId: student.classId,
      status:  'active',
    }).lean()

    res.json({
      success: true,
      data: {
        student:       buildStudentResponse(student),
        activeSession: activeSession
          ? {
              sessionId: activeSession._id,
              subject:   activeSession.subject,
              classId:   activeSession.classId,
              startedAt: activeSession.startedAt,
              status:    activeSession.status,
            }
          : null,
        hasActiveSession: !!activeSession,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {login, profile }