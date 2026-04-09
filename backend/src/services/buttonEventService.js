// buttonEventService.js
// Responsabilité unique : créer et persister un ButtonEvent brut en base.
// Il ne sait rien du calcul ni du snapshot — il fait juste l'enregistrement.

const ButtonEvent = require("../models/Buttonevent");

/**
 * Valide les données d'entrée avant tout traitement.
 * Lève une erreur explicite si quelque chose manque ou est invalide.
 */
function validateButtonPress({ studentId, sessionId, buttonType, source }) {
  const VALID_BUTTON_TYPES = ["understand", "confused", "overwhelmed", "help"];
  const VALID_SOURCES = ["simulated", "iot", "manual"];

  if (!studentId) throw new Error("studentId est requis");
  if (!sessionId) throw new Error("sessionId est requis");
  if (!buttonType) throw new Error("buttonType est requis");
  if (!VALID_BUTTON_TYPES.includes(buttonType)) {
    throw new Error(
      `buttonType invalide : "${buttonType}". Valeurs acceptées : ${VALID_BUTTON_TYPES.join(", ")}`
    );
  }
  if (!source) throw new Error("source est requise");
  if (!VALID_SOURCES.includes(source)) {
    throw new Error(
      `source invalide : "${source}". Valeurs acceptées : ${VALID_SOURCES.join(", ")}`
    );
  }
}

/**
 * Crée et sauvegarde un ButtonEvent en base.
 * Retourne le document Mongoose créé.
 *
 * Exemple d'entrée :
 * { studentId: "abc", sessionId: "xyz", buttonType: "confused", source: "simulated" }
 *
 * Exemple de sortie :
 * { _id: "...", studentId: "abc", sessionId: "xyz", buttonType: "confused",
 *   source: "simulated", timestamp: 2024-01-15T10:30:00.000Z }
 */
async function createButtonEvent({ studentId, sessionId, buttonType, source }) {
  validateButtonPress({ studentId, sessionId, buttonType, source });

  const event = new ButtonEvent({
    studentId,
    sessionId,
    buttonType,
    source,
    timestamp: new Date(),
  });

  await event.save();
  return event;
}

/**
 * Récupère tous les ButtonEvents d'une session, groupés par élève.
 * Utilisé par sessionService pour recalculer les counts.
 *
 * Retourne un objet du type :
 * {
 *   "studentId1": { understand: 2, confused: 1, overwhelmed: 0, help: 0 },
 *   "studentId2": { understand: 0, confused: 3, overwhelmed: 1, help: 1 },
 * }
 */
async function getCountsByStudentForSession(sessionId) {
  const events = await ButtonEvent.find({ sessionId });

  const counts = {};

  for (const event of events) {
    const sid = event.studentId.toString();

    if (!counts[sid]) {
      counts[sid] = { understand: 0, confused: 0, overwhelmed: 0, help: 0 };
    }

    if (counts[sid][event.buttonType] !== undefined) {
      counts[sid][event.buttonType]++;
    }
  }

  return counts;
}

module.exports = {
  createButtonEvent,
  getCountsByStudentForSession,
  validateButtonPress,
};