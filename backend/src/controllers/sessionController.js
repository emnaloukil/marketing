// sessionController.js
// Rôle : lire req → appeler le service → répondre avec res.json
// Aucune logique métier ici. Le controller est un traducteur HTTP ↔ service.

const ClassSession = require("../models/Classsession");
const { startSession, endSession } = require("../services/sessionService");

/**
 * POST /api/sessions/start
 * Crée une nouvelle session et la démarre immédiatement.
 * Body attendu : { classId, teacherId, subject }
 */
async function start(req, res) {
  try {
    const { classId, teacherId, subject } = req.body;

    if (!classId || !teacherId || !subject) {
      return res.status(400).json({
        success: false,
        message: "classId, teacherId et subject sont requis",
      });
    }

    const existingActiveSession = await ClassSession.findOne({
      classId,
      status: "active",
    }).lean();

    if (existingActiveSession) {
      return res.status(400).json({
        success: false,
        message: "Une session active existe déjà pour cette classe",
        data: existingActiveSession,
      });
    }

    const session = await ClassSession.create({
      classId,
      teacher: teacherId,
      subject,
      status: "planned",
    });

    const started = await startSession(session._id.toString());

    res.status(201).json({
      success: true,
      message: "Session démarrée",
      data: started,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/sessions/:id/end
 * Termine une session active.
 */
async function end(req, res) {
  try {
    const session = await endSession(req.params.id);
    res.json({ success: true, message: "Session terminée", data: session });
  } catch (err) {
    const status = err.message.includes("introuvable") ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/sessions/active/:classId
 * Récupère la session active d'une classe (s'il y en a une).
 */
async function getActive(req, res) {
  try {
    const session = await ClassSession.findOne({
      classId: req.params.classId,
      status: "active",
    })
      .sort({ startedAt: -1 })
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Aucune session active pour cette classe",
      });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/sessions/:id
 * Récupère une session par son ID (sans calcul, juste le document brut).
 */
async function getById(req, res) {
  try {
    const session = await ClassSession.findById(req.params.id).lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session introuvable",
      });
    }

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { start, end, getActive, getById };