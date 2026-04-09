// eventController.js
// Rôle : recevoir un appui bouton, appeler processButtonPress, retourner le payload.
// C'est la porte d'entrée principale de toute la logique métier.

const ButtonEvent = require("../models/Buttonevent");
const { processButtonPress } = require("../services/sessionService");

/**
 * POST /api/events/button-press
 * Corps attendu : { studentId, sessionId, buttonType, source }
 *
 * C'est l'endpoint central du projet.
 * Il appelle processButtonPress() qui fait tout le travail :
 * validation → ButtonEvent → counts → scores → snapshot → payload
 */
async function buttonPress(req, res) {
  try {
    const { studentId, sessionId, buttonType, source } = req.body;

    // processButtonPress fait la validation et retourne le payload complet
    const payload = await processButtonPress({
      studentId,
      sessionId,
      buttonType,
      source,
    });

    res.status(201).json({
      success: true,
      message: "Événement traité",
      data: payload,
    });
  } catch (err) {
    // On distingue erreurs de validation (400) des erreurs serveur (500)
    const isValidationError =
      err.message.includes("requis") ||
      err.message.includes("invalide") ||
      err.message.includes("introuvable") ||
      err.message.includes("pas active");

    const status = isValidationError ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/events/session/:sessionId
 * Récupère tous les ButtonEvents bruts d'une session.
 * Utile pour debug, audit, ou historique.
 */
async function getBySession(req, res) {
  try {
    const events = await ButtonEvent.find({ sessionId: req.params.sessionId })
      .sort({ timestamp: 1 }) // ordre chronologique
      .lean();

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { buttonPress, getBySession };