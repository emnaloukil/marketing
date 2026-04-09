// simulationController.js
// Rôle : lire req → appeler simulationService → répondre.
// Aucune logique ici, comme tous les autres controllers du projet.

const {
  startSimulation,
  stopSimulation,
  manualPress,
  getActiveSimulations,
  PROFILES,
} = require('../services/simulationService')

/**
 * POST /api/simulation/start
 * Lance une simulation automatique pour une session.
 *
 * Body attendu :
 * {
 *   sessionId: "abc123",
 *   studentIds: ["s1", "s2", "s3"],
 *   intervalMs: 4000,                          // optionnel, défaut 5000
 *   studentProfiles: {                         // optionnel
 *     "s1": "engaged",
 *     "s2": "struggling",
 *     "s3": "lost"
 *   }
 * }
 */
async function start(req, res) {
  try {
    const { sessionId, studentIds, intervalMs, studentProfiles } = req.body

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId est requis' })
    }
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'studentIds est requis (tableau non vide)' })
    }

    const result = startSimulation({ sessionId, studentIds, intervalMs, studentProfiles })

    res.status(201).json({
      success: true,
      message: 'Simulation démarrée',
      data: result,
    })
  } catch (err) {
    const status = err.message.includes('déjà active') ? 409 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/simulation/stop
 * Arrête la simulation d'une session.
 *
 * Body attendu : { sessionId: "abc123" }
 */
async function stop(req, res) {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId est requis' })
    }

    const result = stopSimulation(sessionId)

    res.json({
      success: true,
      message: 'Simulation arrêtée',
      data: result,
    })
  } catch (err) {
    const status = err.message.includes('Aucune simulation') ? 404 : 500
    res.status(status).json({ success: false, message: err.message })
  }
}

/**
 * POST /api/simulation/press
 * Simule une pression manuelle immédiate (source = "manual").
 *
 * Body attendu :
 * {
 *   studentId:  "s1",
 *   sessionId:  "abc123",
 *   buttonType: "confused"
 * }
 */
async function press(req, res) {
  try {
    const { studentId, sessionId, buttonType } = req.body

    if (!studentId || !sessionId || !buttonType) {
      return res.status(400).json({
        success: false,
        message: 'studentId, sessionId et buttonType sont requis',
      })
    }

    const payload = await manualPress({ studentId, sessionId, buttonType })

    res.status(201).json({
      success: true,
      message: 'Press manuel traité',
      data: payload,
    })
  } catch (err) {
    const isValidation = err.message.includes('requis')
      || err.message.includes('invalide')
      || err.message.includes('pas active')
      || err.message.includes('introuvable')

    res.status(isValidation ? 400 : 500).json({ success: false, message: err.message })
  }
}

/**
 * GET /api/simulation/active
 * Liste les simulations en cours (utile pour debug).
 */
function active(req, res) {
  const list = getActiveSimulations()
  res.json({
    success: true,
    count: list.length,
    availableProfiles: Object.keys(PROFILES),
    data: list,
  })
}

module.exports = { start, stop, press, active }