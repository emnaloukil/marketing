const ClassSession    = require('../models/Classsession')
const SessionSnapshot = require('../models/SessionSnapshot')

// POST /api/live/start
// Crée ou récupère la session active pour teacherId + classId + subject.
async function startOrGet(req, res) {
  try {
    const { teacherId, classId, subject } = req.body
    if (!teacherId || !classId || !subject) {
      return res.status(400).json({ success: false, message: 'teacherId, classId et subject sont requis' })
    }

    const VALID = ['mathematics', 'reading', 'sciences']
    if (!VALID.includes(subject)) {
      return res.status(400).json({ success: false, message: `subject invalide. Valeurs : ${VALID.join(', ')}` })
    }

    // Chercher une session active pour CE teacher + CETTE classe + CETTE matière
    const existing = await ClassSession.findOne({ teacherId, classId, subject, status: 'active' }).lean()

    if (existing) {
      const snapshot = await SessionSnapshot.findOne({ sessionId: existing._id }).lean()
      return res.json({ success: true, resumed: true, message: 'Session retrouvée', data: { session: existing, snapshot: snapshot || null } })
    }

    // Vérifier si le teacher a UNE AUTRE session active (autre classe ou matière)
    const conflict = await ClassSession.findOne({ teacherId, status: 'active' }).lean()
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Vous avez déjà une session active (${conflict.classId} · ${conflict.subject}). Terminez-la d'abord.`,
        data:    { existingSession: conflict },
      })
    }

    const session = await ClassSession.create({ teacherId, classId, subject, status: 'active', startedAt: new Date() })

    res.status(201).json({ success: true, resumed: false, message: 'Session démarrée', data: { session, snapshot: null } })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Conflit : une session active existe déjà pour ce teacher' })
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/live/session/:sessionId/snapshot
async function getSnapshot(req, res) {
  try {
    const snapshot = await SessionSnapshot.findOne({ sessionId: req.params.sessionId }).lean()
    res.json({ success: true, hasData: !!snapshot, data: snapshot || null })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/live/session/:sessionId/end
async function endSession(req, res) {
  try {
    const session = await ClassSession.findById(req.params.sessionId)
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable' })
    if (session.status === 'ended') return res.status(409).json({ success: false, message: 'Session déjà terminée' })

    session.status  = 'ended'
    session.endedAt = new Date()
    await session.save()

    // Émettre via Socket.IO
    const io = req.app.get('io')
    if (io) io.to(`session_${session._id}`).emit('session:ended', { sessionId: session._id, endedAt: session.endedAt })

    res.json({ success: true, message: 'Session terminée', data: session })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/live/teacher/:teacherId/active
async function getActive(req, res) {
  try {
    const session = await ClassSession.findOne({ teacherId: req.params.teacherId, status: 'active' }).lean()
    if (!session) return res.json({ success: true, hasActive: false, data: null })
    const snapshot = await SessionSnapshot.findOne({ sessionId: session._id }).lean()
    res.json({ success: true, hasActive: true, data: { session, snapshot: snapshot || null } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { startOrGet, getSnapshot, endSession, getActive }