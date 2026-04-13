// sessionService.js
// Responsabilité : orchestrer tout ce qui se passe après une pression de bouton.
// C'est le chef d'orchestre : il appelle buttonEventService, engagementEngine,
// recommendationService, puis met à jour le SessionSnapshot.

// sessionService.js
// Responsabilité : orchestrer tout ce qui se passe après une pression de bouton.

const ClassSession   = require('../models/Classsession')
const SessionSnapshot = require('../models/SessionSnapshot')
const { getIO }      = require('../sockets/ioInstance')

const { createButtonEvent, getCountsByStudentForSession } = require('./buttonEventService')
const {
  calcScore,
  detectTrend,
  buildBreakdown,
  getAvgScore,
} = require('./engagementEngine')
const { getRecommendations } = require('./recommendationService')

// ─────────────────────────────────────────────────────────────────────────────
// FONCTION PRINCIPALE
// ─────────────────────────────────────────────────────────────────────────────

async function processButtonPress({ studentId, sessionId, buttonType, source }) {

  // ── Étape 1 : Vérifier la session AVANT tout ─────────────────────────────
  const session = await ClassSession.findById(sessionId).lean()
  if (!session) {
    throw new Error(`Session introuvable : ${sessionId}`)
  }
  if (session.status !== 'active') {
    throw new Error(`La session "${sessionId}" n'est pas active (status: ${session.status})`)
  }

  // ── Étape 2 : Création du ButtonEvent ────────────────────────────────────
  const buttonEvent = await createButtonEvent({
    studentId,
    sessionId,
    buttonType,
    source,
  })

  // ── Étape 3 : Recalcul des counts par élève ───────────────────────────────
  const countsByStudent = await getCountsByStudentForSession(sessionId)

  // ── Étape 4 : Score d'engagement par élève ────────────────────────────────
  const studentScores = {}
  for (const [sid, counts] of Object.entries(countsByStudent)) {
    studentScores[sid] = calcScore(counts)
  }

  // ── Étape 5 : Score global de classe ─────────────────────────────────────
  // On passe les valeurs (tableau de nombres) à getAvgScore
  const scoreValues = Object.values(studentScores).filter(s => s !== null)
  const classScore  = scoreValues.length > 0 ? getAvgScore(scoreValues) : 0

  // ── Étape 6 : Breakdown ───────────────────────────────────────────────────
  // buildBreakdown attend un tableau de scores (nombres)
  // On lui passe scoreValues — pas studentScores (objet)
  const breakdown = buildBreakdown(scoreValues)

  // ── Étape 7 : Historique + Trend ─────────────────────────────────────────
  // On récupère le snapshot existant pour avoir l'historique des classScores
  // Un seul snapshot par session → on accumule classScoreHistory dedans
  const existingSnapshot   = await SessionSnapshot.findOne({ sessionId }).lean()
  const previousHistory    = existingSnapshot ? (existingSnapshot.classScoreHistory || []) : []

  // Ajouter le nouveau score à l'historique
  const classScoreHistory  = [...previousHistory, classScore]

  // detectTrend analyse l'historique complet
  // Retourne null si moins de 4 scores — normal au début de session
  const trend = detectTrend(classScoreHistory)

  // ── Étape 8 : Recommandations ─────────────────────────────────────────────
  // Seulement si trend est détecté
  const recommendations = trend ? getRecommendations(trend) : []

  // ── Étape 9 : Mise à jour du SessionSnapshot ──────────────────────────────
  const snapshot = await SessionSnapshot.findOneAndUpdate(
    { sessionId },
    {
      sessionId,
      classScore,
      classScoreHistory,   // ← historique accumulé
      studentScores,
      breakdown,
      trend,
      recommendations,
      countsByStudent,
      lastEventAt: buttonEvent.timestamp,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  // ── Étape 10 : Payload final ──────────────────────────────────────────────
  const payload = {
    sessionId,
    lastEvent: {
      studentId:  buttonEvent.studentId,
      buttonType: buttonEvent.buttonType,
      source:     buttonEvent.source,
      timestamp:  buttonEvent.timestamp,
    },
    classScore,
    classScoreHistory,
    studentScores,
    breakdown,
    trend,
    recommendations,
    countsByStudent,
    snapshotId: snapshot._id,
  }

  // ── Étape 11 : Émission Socket.IO ─────────────────────────────────────────
  const io = getIO()
  if (io) {
    io.to(`session_${sessionId}`).emit('dashboard:update', payload)
    console.log(`[Socket] dashboard:update émis vers session_${sessionId}`)
  }

  return payload
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS UTILITAIRES DE SESSION
// ─────────────────────────────────────────────────────────────────────────────

async function startSession(sessionId) {
  const session = await ClassSession.findById(sessionId)
  if (!session) throw new Error(`Session introuvable : ${sessionId}`)
  if (session.status !== 'planned') {
    throw new Error(`Impossible de démarrer : la session est déjà "${session.status}"`)
  }

  session.status    = 'active'
  session.startedAt = new Date()
  await session.save()
  return session
}

async function endSession(sessionId) {
  const session = await ClassSession.findById(sessionId)
  if (!session) throw new Error(`Session introuvable : ${sessionId}`)
  if (session.status === 'ended') {
    throw new Error('Cette session est déjà terminée')
  }

  session.status  = 'ended'
  session.endedAt = new Date()
  await session.save()

  // Émettre session:ended via Socket.IO
  const io = getIO()
  if (io) {
    io.to(`session_${sessionId}`).emit('session:ended', {
      sessionId,
      endedAt: session.endedAt,
    })
    console.log(`[Socket] session:ended émis vers session_${sessionId}`)
  }

  return session
}

async function getSessionSnapshot(sessionId) {
  const snapshot = await SessionSnapshot.findOne({ sessionId }).lean()
  if (!snapshot) {
    throw new Error(`Aucun snapshot trouvé pour la session : ${sessionId}`)
  }
  return snapshot
}

module.exports = {
  processButtonPress,
  startSession,
  endSession,
  getSessionSnapshot,
}