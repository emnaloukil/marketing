// parentChildController.js
// Rôle : gérer les enfants d'un parent connecté.
// Quand le parent ajoute un enfant, le compte enfant est créé automatiquement
// avec un studentCode unique + un PIN par défaut (année de naissance).

// parentChildController.js

const Student = require('../models/Student')

const VALID_PROFILES = ['none', 'adhd', 'autism', 'dyslexia']

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Génère un studentCode unique lisible.
 * Format : STU-XXXX (lettres + chiffres sans ambiguïté visuelle)
 * On exclut I, O, 0, 1 pour éviter les confusions visuelles.
 */
async function generateUniqueStudentCode() {
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
 * Génère un PIN aléatoire à 4 chiffres.
 * Toujours entre 1000 et 9999 — jamais de zéro en tête.
 */
function generatePIN() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/parent/children
 * Le parent ajoute un enfant.
 * Le compte enfant est créé automatiquement avec :
 *   - studentCode généré automatiquement (ex: STU-A3K9)
 *   - PIN aléatoire à 4 chiffres (ex: 7342)
 *
 * Body : {
 *   parentId,
 *   firstName,
 *   lastName,
 *   classId,
 *   supportProfile,
 *   dateOfBirth  ← obligatoire (YYYY-MM-DD)
 * }
 */
async function addChild(req, res) {
  try {
    const {
      parentId,
      firstName,
      lastName,
      classId,
      supportProfile = 'none',
      dateOfBirth,
    } = req.body

    // ── Validation ────────────────────────────────────────────────────────────
    if (!parentId) {
      return res.status(400).json({ success: false, message: 'parentId est requis' })
    }
    if (!firstName) {
      return res.status(400).json({ success: false, message: 'firstName est requis' })
    }
    if (!lastName) {
      return res.status(400).json({ success: false, message: 'lastName est requis' })
    }
    if (!classId) {
      return res.status(400).json({ success: false, message: 'classId est requis' })
    }
    if (!dateOfBirth) {
      return res.status(400).json({ success: false, message: 'dateOfBirth est requise' })
    }

    const parsedDate = new Date(dateOfBirth)
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'dateOfBirth invalide. Format attendu : YYYY-MM-DD',
      })
    }

    if (!VALID_PROFILES.includes(supportProfile)) {
      return res.status(400).json({
        success: false,
        message: `supportProfile invalide. Valeurs acceptées : ${VALID_PROFILES.join(', ')}`,
      })
    }

    // ── Vérifier que l'enfant n'existe pas déjà pour ce parent ───────────────
    // Bloque si même firstName + lastName + dateOfBirth pour le même parent
    const existingChild = await Student.findOne({
      parent:      parentId,
      firstName:   firstName.trim(),
      lastName:    lastName.trim(),
      dateOfBirth: parsedDate,
    }).lean()

    if (existingChild) {
      return res.status(409).json({
        success: false,
        message: `${firstName} ${lastName} est déjà ajouté pour ce parent`,
        data: {
          existingStudentId: existingChild._id,
          studentCode:       existingChild.studentCode,
        },
      })
    }

    // ── Générer studentCode unique ─────────────────────────────────────────────
    const studentCode = await generateUniqueStudentCode()

    // ── Générer PIN aléatoire ─────────────────────────────────────────────────
    const pin = generatePIN()

    // ── Créer l'enfant ────────────────────────────────────────────────────────
    // Le hook pre('save') dans Student.js hashera le PIN automatiquement
    const student = await Student.create({
      firstName:      firstName.trim(),
      lastName:       lastName.trim(),
      parent:         parentId,
      classId:        classId.trim(),
      supportProfile,
      dateOfBirth:    parsedDate,
      studentCode,
      pin,
    })

    // ── Relire depuis la base avec populate ───────────────────────────────────
    // .select('-pin') exclut pin au niveau MongoDB — garanti sans pin dans réponse
    // On relit avec findById car populate() après create() ne marche pas toujours
    const studentObj = await Student.findById(student._id)
      .select('-pin')
      .populate('parent', 'firstName lastName email')
      .lean()

    res.status(201).json({
      success: true,
      message: `${student.firstName} a bien été ajouté`,
      data: {
        student: studentObj,
        // PIN retourné en clair UNE SEULE FOIS — le parent le donne à l'enfant
        accessInfo: {
          studentCode,
          pin,
          note: 'Donne ce code et ce PIN à l\'enfant pour qu\'il se connecte',
        },
      },
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Erreur de génération studentCode — réessaie',
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/parent/children/:parentId
 * Retourne tous les enfants d'un parent.
 * Appelé à chaque ouverture de l'app parent.
 * Si liste vide → le parent est invité à ajouter son premier enfant.
 */
async function getChildren(req, res) {
  try {
    const { parentId } = req.params

    const children = await Student.find({ parent: parentId })
      .select('-pin')
      .sort({ firstName: 1 })
      .populate('parent', 'firstName lastName email')
      .lean()

    res.json({
      success: true,
      count:   children.length,
      isEmpty: children.length === 0,
      message: children.length === 0
        ? 'Aucun enfant ajouté pour le moment'
        : `${children.length} enfant(s) trouvé(s)`,
      data: children,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/parent/children/detail/:studentId
 * Retourne le détail complet d'un enfant.
 *
 * ⚠️  Dans parentChildRoutes.js, cette route DOIT être déclarée
 * AVANT /:studentId pour éviter qu'Express lise "detail" comme un ID.
 */
async function getChildDetail(req, res) {
  try {
    const student = await Student.findById(req.params.studentId)
      .select('-pin')
      .populate('parent', 'firstName lastName email')
      .lean()

    if (!student) {
      return res.status(404).json({ success: false, message: 'Enfant introuvable' })
    }

    res.json({ success: true, data: student })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

/**
 * PUT /api/parent/children/:studentId
 * Met à jour les informations d'un enfant.
 * Non modifiables : parent, studentCode, pin
 */
async function updateChild(req, res) {
  try {
    const { studentId } = req.params
    const {
      firstName,
      lastName,
      classId,
      supportProfile,
      dateOfBirth,
    } = req.body

    const updates = {}

    if (firstName) updates.firstName = firstName.trim()
    if (lastName)  updates.lastName  = lastName.trim()
    if (classId)   updates.classId   = classId.trim()

    if (supportProfile !== undefined) {
      if (!VALID_PROFILES.includes(supportProfile)) {
        return res.status(400).json({
          success: false,
          message: `supportProfile invalide. Valeurs acceptées : ${VALID_PROFILES.join(', ')}`,
        })
      }
      updates.supportProfile = supportProfile
    }

    if (dateOfBirth !== undefined) {
      if (dateOfBirth === null || dateOfBirth === '') {
        updates.dateOfBirth = null
      } else {
        const parsed = new Date(dateOfBirth)
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'dateOfBirth invalide. Format attendu : YYYY-MM-DD',
          })
        }
        updates.dateOfBirth = parsed
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun champ à mettre à jour fourni',
      })
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select('-pin')
      .populate('parent', 'firstName lastName email')

    if (!student) {
      return res.status(404).json({ success: false, message: 'Enfant introuvable' })
    }

    res.json({
      success: true,
      message: `${student.firstName} a bien été mis à jour`,
      data:    student,
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { addChild, getChildren, getChildDetail, updateChild }