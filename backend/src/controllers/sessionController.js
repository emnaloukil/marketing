// sessionController.js
// Lire req → appeler le service → répondre.
// La logique métier reste dans sessionService.js.

const ClassSession = require('../models/Classsession')
const { startSession, endSession, getSessionSnapshot } = require('../services/sessionService')

const VALID_SUBJECTS = ['mathematics', 'reading', 'sciences']

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sessions/start
// ─────────────────────────────────────────────────────────────────────────────
// Le teacher choisit sa classe et sa matière, clique Start Session.
// Le backend vérifie qu'il n'y a pas déjà une session active pour cette classe,
// puis crée la session et retourne le sessionId au frontend.
//
// Body attendu :
// {
//   "teacherId": "...",
//   "classId":   "CM2-A",
//   "subject":   "mathematics"
// }

async function start(req, res) {
  try {
    const { teacherId, classId, subject } = req.body

    // ── Validation ────────────────────────────────────────────────────────────
    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'teacherId est requis' })
    }
    if (!classId || !classId.trim()) {
      return res.status(400).json({ success: false, message: 'classId est requis' })
    }
    if (!subject) {
      return res.status(400).json({ success: false, message: 'subject est requis' })
    }
    if (!VALID_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: `subject invalide. Valeurs acceptées : ${VALID_SUBJECTS.join(', ')}`,
      })
    }

    // ── Vérifier qu'il n'y a pas déjà une session active pour cette classe ───
    // Double sécurité : on vérifie ici ET l'index unique MongoDB protège en base.
    // ✅ Nouveau — vérifie le teacher ET la classe
const existingByTeacher = await ClassSession.findOne({
  teacherId: teacherId,
  status:    'active',
}).lean()

if (existingByTeacher) {
  return res.status(409).json({
    success: false,
    message: `Vous avez déjà une session active (classe: ${existingByTeacher.classId}, matière: ${existingByTeacher.subject})`,
    data: {
      existingSessionId: existingByTeacher._id,
      classId:           existingByTeacher.classId,
      subject:           existingByTeacher.subject,
      startedAt:         existingByTeacher.startedAt,
    },
  })
}

const existingByClass = await ClassSession.findOne({
  classId: classId.trim(),
  status:  'active',
}).lean()

if (existingByClass) {
  return res.status(409).json({
    success: false,
    message: `Une session est déjà active pour la classe ${classId}`,
    data: {
      existingSessionId: existingByClass._id,
      subject:           existingByClass.subject,
      startedAt:         existingByClass.startedAt,
    },
  })
}
    // ── Créer la session directement active ───────────────────────────────────
    const session = await ClassSession.create({
      teacherId,
      classId:   classId.trim(),
      subject,
      status:    'active',
      startedAt: new Date(),
    })

    // ── Réponse — tout ce dont le frontend teacher a besoin ───────────────────
    res.status(201).json({
      success: true,
      message: 'Session démarrée',
      data: {
        sessionId:  session._id,   // ← frontend stocke cet ID pour Socket.IO + button presses
        teacherId:  session.teacherId,
        classId:    session.classId,
        subject:    session.subject,
        status:     session.status,
        startedAt:  session.startedAt,
      },
    })
  } catch (err) {
    // Index unique MongoDB déclenché en cas de race condition
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Une session active existe déjà pour cette classe (conflit base de données)',
      })
    }
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sessions/:id/end
// ─────────────────────────────────────────────────────────────────────────────

async function end(req, res) {
  try {
    const session = await endSession(req.params.id)
    res.json({ success: true, message: 'Session terminée', data: session })
  } catch (err) {
    const status = err.message.includes('introuvable') ? 404
      : err.message.includes('déjà terminée')          ? 409
      : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sessions/active/:classId
// ─────────────────────────────────────────────────────────────────────────────
// Retourne la session active d'une classe.
// Utilisé par le frontend teacher pour retrouver une session en cours
// si le teacher recharge la page ou se reconnecte.

async function getActive(req, res) {
  try {
    const session = await ClassSession.findOne({
      classId: req.params.classId,
      status:  'active',
    })
      .sort({ startedAt: -1 })  // la plus récente en cas de données incohérentes
      .lean()

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `Aucune session active pour la classe ${req.params.classId}`,
      })
    }

    res.json({ success: true, data: session })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sessions/:id
// ─────────────────────────────────────────────────────────────────────────────

async function getById(req, res) {
  try {
    const session = await ClassSession.findById(req.params.id).lean()

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session introuvable' })
    }

    res.json({ success: true, data: session })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sessions/teacher/:teacherId
// ─────────────────────────────────────────────────────────────────────────────
// Historique des sessions d'un teacher (utile pour le dashboard).

async function getByTeacher(req, res) {
  try {
    const sessions = await ClassSession.find({ teacherId: req.params.teacherId })
      .sort({ startedAt: -1 })
      .lean()

    res.json({ success: true, count: sessions.length, data: sessions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { start, end, getActive, getById, getByTeacher }