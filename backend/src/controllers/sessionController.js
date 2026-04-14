// sessionController.js
// Lire req → appeler le service → répondre.
// La logique métier reste dans sessionService.js.

const ClassSession = require('../models/Classsession')
const { endSession } = require('../services/sessionService')

const VALID_SUBJECTS = ['mathematics', 'reading', 'sciences']

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sessions/start
// ─────────────────────────────────────────────────────────────────────────────

async function start(req, res) {
  try {
    const { teacherId, classId, subject } = req.body

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'teacherId est requis',
      })
    }

    if (!classId || !classId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'classId est requis',
      })
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'subject est requis',
      })
    }

    if (!VALID_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: `subject invalide. Valeurs acceptées : ${VALID_SUBJECTS.join(', ')}`,
      })
    }

    const cleanClassId = classId.trim()

    // 1) Si la même session active existe déjà, on la retourne
    const existingSameSession = await ClassSession.findOne({
      teacherId,
      classId: cleanClassId,
      subject,
      status: 'active',
    }).lean()

    if (existingSameSession) {
      return res.status(200).json({
        success: true,
        message: 'Session active existante récupérée',
        data: {
          sessionId: existingSameSession._id,
          teacherId: existingSameSession.teacherId,
          classId: existingSameSession.classId,
          subject: existingSameSession.subject,
          status: existingSameSession.status,
          startedAt: existingSameSession.startedAt,
          endedAt: existingSameSession.endedAt,
        },
      })
    }

    // 2) Si le teacher a déjà une autre session active, on bloque
    const existingByTeacher = await ClassSession.findOne({
      teacherId,
      status: 'active',
    }).lean()

    if (existingByTeacher) {
      return res.status(409).json({
        success: false,
        message: `Vous avez déjà une session active (classe: ${existingByTeacher.classId}, matière: ${existingByTeacher.subject})`,
        data: {
          existingSessionId: existingByTeacher._id,
          classId: existingByTeacher.classId,
          subject: existingByTeacher.subject,
          startedAt: existingByTeacher.startedAt,
        },
      })
    }

    // 3) Si une autre session active existe pour la même classe, on bloque
    const existingByClass = await ClassSession.findOne({
      classId: cleanClassId,
      status: 'active',
    }).lean()

    if (existingByClass) {
      return res.status(409).json({
        success: false,
        message: `Une session est déjà active pour la classe ${cleanClassId}`,
        data: {
          existingSessionId: existingByClass._id,
          subject: existingByClass.subject,
          startedAt: existingByClass.startedAt,
        },
      })
    }

    // 4) Sinon on crée une nouvelle session
    const session = await ClassSession.create({
      teacherId,
      classId: cleanClassId,
      subject,
      status: 'active',
      startedAt: new Date(),
    })

    return res.status(201).json({
      success: true,
      message: 'Session démarrée',
      data: {
        sessionId: session._id,
        teacherId: session.teacherId,
        classId: session.classId,
        subject: session.subject,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      },
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Une session active existe déjà pour cette classe (conflit base de données)',
      })
    }

    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/sessions/:id/end
// ─────────────────────────────────────────────────────────────────────────────

async function end(req, res) {
  try {
    const session = await endSession(req.params.id)

    return res.json({
      success: true,
      message: 'Session terminée',
      data: session,
    })
  } catch (err) {
    const status =
      err.message.includes('introuvable') ? 404 :
      err.message.includes('déjà terminée') ? 409 :
      500

    return res.status(status).json({
      success: false,
      message: err.message,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sessions/active/:classId
// ─────────────────────────────────────────────────────────────────────────────

async function getActive(req, res) {
  try {
    const session = await ClassSession.findOne({
      classId: req.params.classId,
      status: 'active',
    })
      .sort({ startedAt: -1 })
      .lean()

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `Aucune session active pour la classe ${req.params.classId}`,
      })
    }

    return res.json({
      success: true,
      data: session,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sessions/:id
// ─────────────────────────────────────────────────────────────────────────────

async function getById(req, res) {
  try {
    const session = await ClassSession.findById(req.params.id).lean()

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session introuvable',
      })
    }

    return res.json({
      success: true,
      data: session,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/sessions/teacher/:teacherId
// ─────────────────────────────────────────────────────────────────────────────

async function getByTeacher(req, res) {
  try {
    const sessions = await ClassSession.find({
      teacherId: req.params.teacherId,
    })
      .sort({ startedAt: -1 })
      .lean()

    return res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    })
  }
}

module.exports = {
  start,
  end,
  getActive,
  getById,
  getByTeacher,
}