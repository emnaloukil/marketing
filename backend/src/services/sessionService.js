// sessionService.js
// Responsabilité : orchestrer tout ce qui se passe après une pression de bouton.
// C'est le chef d'orchestre : il appelle buttonEventService, engagementEngine,
// recommendationService, puis met à jour le SessionSnapshot.

const ClassSession = require("../models/Classsession");
const SessionSnapshot = require("../models/SessionSnapshot");
const { getIO } = require("../sockets/ioInstance");

const { createButtonEvent, getCountsByStudentForSession } = require("./buttonEventService");
const {
  calcScore,
  detectTrend,
  buildBreakdown,
  getAvgScore,
} = require("./engagementEngine");
const { getRecommendations } = require("./recommendationService");

// ─────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────

/**
 * processButtonPress — point d'entrée unique pour traiter une pression de bouton.
 *
 * Peu importe la source (simulation, IoT, test manuel), tout passe ici.
 * Cette fonction fait exactement 7 choses dans l'ordre :
 *
 *  1. Valide les données (via createButtonEvent qui appelle validateButtonPress)
 *  2. Crée et sauvegarde le ButtonEvent brut
 *  3. Recalcule les counts par élève pour toute la session
 *  4. Recalcule engagementScore par élève
 *  5. Recalcule le classScore (moyenne de classe)
 *  6. Recalcule breakdown et trend
 *  7. Met à jour (ou crée) le SessionSnapshot
 *  8. Retourne un payload prêt à être envoyé au teacher dashboard
 *
 * @param {Object} params
 * @param {string} params.studentId   - ID de l'élève qui a appuyé
 * @param {string} params.sessionId   - ID de la session active
 * @param {string} params.buttonType  - "understand" | "confused" | "overwhelmed" | "help"
 * @param {string} params.source      - "simulated" | "iot" | "manual"
 *
 * @returns {Object} payload - données prêtes pour le teacher dashboard
 */
async function processButtonPress({ studentId, sessionId, buttonType, source }) {

  // ── Étape 1 : Vérifier la session AVANT tout ─────────────────────────────
  // On vérifie EN PREMIER que la session existe et est active.
  // Si ce n'est pas le cas, on lève une erreur immédiatement,
  // sans avoir rien écrit en base.
  const session = await ClassSession.findById(sessionId).lean();
  if (!session) {
    throw new Error(`Session introuvable : ${sessionId}`);
  }
  if (session.status !== "active") {
    throw new Error(
      `La session "${sessionId}" n'est pas active (status: ${session.status})`
    );
  }

  // ── Étape 2 : Validation + Création du ButtonEvent ───────────────────────
  // On arrive ici seulement si la session est valide et active.
  // createButtonEvent valide buttonType et source, puis sauvegarde.
  const buttonEvent = await createButtonEvent({
    studentId,
    sessionId,
    buttonType,
    source,
  });

  // ── Étape 3 : Recalcul des counts par élève ───────────────────────────────
  const countsByStudent = await getCountsByStudentForSession(sessionId);

  // ── Étape 4 : Score d'engagement par élève ────────────────────────────────
  const studentScores = {};
  for (const [sid, counts] of Object.entries(countsByStudent)) {
    studentScores[sid] = calcScore(counts);
  }

  // ── Étape 5 : Score global de classe ─────────────────────────────────────
  const scoreValues = Object.values(studentScores);
  const classScore = scoreValues.length > 0 ? getAvgScore(scoreValues) : 0;

  // ── Étape 6 : Breakdown + Trend ───────────────────────────────────────────
  const breakdown = buildBreakdown(scoreValues);

  const pastSnapshots = await SessionSnapshot.find({ sessionId })
    .sort({ updatedAt: 1 })
    .select("classScore")
    .lean();

  const scoreHistory = pastSnapshots.map((s) => s.classScore);
  scoreHistory.push(classScore);

  const trend = detectTrend(scoreHistory);

  // ── Étape 7 : Recommandations ─────────────────────────────────────────────
  const recommendations = getRecommendations(trend);

  // ── Étape 8 : Mise à jour du SessionSnapshot ──────────────────────────────
  const snapshot = await SessionSnapshot.findOneAndUpdate(
    { sessionId },
    {
      sessionId,
      classScore,
      studentScores,
      breakdown,
      trend,
      recommendations,
      countsByStudent,
      lastEventAt: buttonEvent.timestamp,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // ── Étape 9 : Payload final ───────────────────────────────────────────────
  const payload = {
    sessionId,
    lastEvent: {
      studentId: buttonEvent.studentId,
      buttonType: buttonEvent.buttonType,
      source: buttonEvent.source,
      timestamp: buttonEvent.timestamp,
    },
    classScore,
    studentScores,
    breakdown,
    trend,
    recommendations,
    countsByStudent,
    snapshotId: snapshot._id,
  };

  // ── Étape 10 : Émission Socket.IO ─────────────────────────────────────────
  const io = getIO();
  if (io) {
    io.to(`session_${sessionId}`).emit("dashboard:update", payload);
    console.log(`[Socket] dashboard:update émis vers session_${sessionId}`);
  }

  return payload;
}

// ─────────────────────────────────────────────
// FONCTIONS UTILITAIRES DE SESSION
// ─────────────────────────────────────────────

/**
 * Démarre une session (passe son status de "planned" à "active").
 * À appeler depuis une route ou un controller.
 */
async function startSession(sessionId) {
  const session = await ClassSession.findById(sessionId);
  if (!session) throw new Error(`Session introuvable : ${sessionId}`);
  if (session.status !== "planned") {
    throw new Error(
      `Impossible de démarrer : la session est déjà "${session.status}"`
    );
  }

  session.status = "active";
  session.startedAt = new Date();
  await session.save();
  return session;
}

/**
 * Termine une session (passe son status à "ended").
 * À appeler depuis une route ou un controller.
 */
async function endSession(sessionId) {
  const session = await ClassSession.findById(sessionId);
  if (!session) throw new Error(`Session introuvable : ${sessionId}`);
  if (session.status === "ended") {
    throw new Error("Cette session est déjà terminée");
  }

  session.status = "ended";
  session.endedAt = new Date();
  await session.save();
  return session;
}

/**
 * Récupère le snapshot actuel d'une session.
 * Utile pour recharger l'état du teacher dashboard.
 */
async function getSessionSnapshot(sessionId) {
  const snapshot = await SessionSnapshot.findOne({ sessionId }).lean();
  if (!snapshot) {
    throw new Error(`Aucun snapshot trouvé pour la session : ${sessionId}`);
  }
  return snapshot;
}

module.exports = {
  processButtonPress,
  startSession,
  endSession,
  getSessionSnapshot,
};