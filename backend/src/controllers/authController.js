// authController.js
// Rôle : register et login pour Teacher et Parent.
//
// Flux register :
//   1. Vérifier que l'email n'existe pas déjà
//   2. Créer le document (le hook pre save hashe le password)
//   3. Retourner un token JWT + les infos sans password
//
// Flux login :
//   1. Trouver le document par email (avec .select('+password'))
//   2. Comparer le password via comparePassword()
//   3. Retourner un token JWT + les infos sans password

const jwt     = require('jsonwebtoken')
const Teacher = require('../models/Teacher')
const Parent  = require('../models/Parent')

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère un token JWT.
 * Le payload contient l'id et le rôle — utilisé plus tard pour les guards.
 *
 * @param {string} id   - _id MongoDB du document
 * @param {string} role - 'teacher' | 'parent'
 * @returns {string} token signé
 */
function generateToken(id, role) {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * Formate la réponse d'auth — jamais de password dans la réponse.
 * @param {Document} user
 * @param {string}   role
 * @returns {Object} { token, user }
 */
function buildAuthResponse(user, role) {
  return {
    token: generateToken(user._id.toString(), role),
    user:  {
      id:        user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role,
      // Champs spécifiques selon le rôle
      ...(role === 'teacher' && { school: user.school, className: user.className }),
      ...(role === 'parent'  && { phone: user.phone }),
      createdAt: user.createdAt,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/teacher/register
 * Body : { firstName, lastName, email, password, school?, className? }
 */
async function teacherRegister(req, res) {
  try {
    const { firstName, lastName, email, password, school, className } = req.body

    // Validation minimale
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, email et password sont requis',
      })
    }

    // Vérifier unicité email
    const existing = await Teacher.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Un compte teacher existe déjà avec cet email',
      })
    }

    // Créer le teacher — le hook pre('save') hashe le password automatiquement
    const teacher = await Teacher.create({
      firstName,
      lastName,
      email,
      password,   // ← sera hashé par le hook, jamais stocké en clair
      school,
      className,
    })

    const response = buildAuthResponse(teacher, 'teacher')

    res.status(201).json({
      success: true,
      message: 'Compte teacher créé',
      data:    response,
    })
  } catch (err) {
    // Erreur Mongoose duplicate key (email unique)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/auth/teacher/login
 * Body : { email, password }
 */
async function teacherLogin(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email et password sont requis',
      })
    }

    // .select('+password') : nécessaire car le champ a select: false dans le schéma
    // Sans ça, this.password serait undefined dans comparePassword()
    const teacher = await Teacher.findOne({ email: email.toLowerCase() })
      .select('+password')

    if (!teacher) {
      // Message volontairement vague — ne pas indiquer si l'email existe
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    const isMatch = await teacher.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    const response = buildAuthResponse(teacher, 'teacher')

    res.json({
      success: true,
      message: 'Connexion réussie',
      data:    response,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/parent/register
 * Body : { firstName, lastName, email, password, phone? }
 */
async function parentRegister(req, res) {
  try {
    const { firstName, lastName, email, password, phone } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, email et password sont requis',
      })
    }

    const existing = await Parent.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Un compte parent existe déjà avec cet email',
      })
    }

    const parent = await Parent.create({
      firstName,
      lastName,
      email,
      password,
      phone,
    })

    const response = buildAuthResponse(parent, 'parent')

    res.status(201).json({
      success: true,
      message: 'Compte parent créé',
      data:    response,
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé',
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/auth/parent/login
 * Body : { email, password }
 */
async function parentLogin(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email et password sont requis',
      })
    }

    const parent = await Parent.findOne({ email: email.toLowerCase() })
      .select('+password')

    if (!parent) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    const isMatch = await parent.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    const response = buildAuthResponse(parent, 'parent')

    res.json({
      success: true,
      message: 'Connexion réussie',
      data:    response,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { teacherRegister, teacherLogin, parentRegister, parentLogin }