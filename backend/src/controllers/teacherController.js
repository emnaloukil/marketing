// teacherController.js
// Rôle : fournir les données calculées dont le teacher dashboard a besoin.
// Lit uniquement le SessionSnapshot déjà calculé — pas de recalcul ici.

const { getSessionSnapshot } = require("../services/sessionService");

/**
 * GET /api/teacher/dashboard/:sessionId
 * Retourne l'état complet et calculé d'une session pour le teacher.
 *
 * Ce endpoint est utilisé :
 * - au chargement initial du dashboard teacher
 * - pour un refresh manuel
 * - Socket.IO prendra le relais pour les mises à jour temps réel
 *
 * Répond avec le dernier SessionSnapshot calculé.
 */
async function getDashboard(req, res) {
  try {
    const snapshot = await getSessionSnapshot(req.params.sessionId);

    res.json({
      success: true,
      data: snapshot,
    });
  } catch (err) {
    const status = err.message.includes("introuvable") ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

module.exports = { getDashboard };