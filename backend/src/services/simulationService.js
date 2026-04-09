// simulationService.js
// Rôle : simuler des pressions de boutons pour une session active.
//
// Architecture :
// - un Map global stocke les intervalles actifs (un par session)
// - chaque tick choisit un élève et un bouton selon son profil
// - tout passe par processButtonPress → même logique que le vrai IoT
// - quand le vrai IoT arrive, on supprime ce fichier, rien d'autre ne change

const { processButtonPress } = require('./sessionService')

// ─────────────────────────────────────────────────────────────────────────────
// PROFILS DE SIMULATION
// ─────────────────────────────────────────────────────────────────────────────
// Un profil définit la probabilité de chaque bouton pour un élève.
// Les poids n'ont pas besoin de sommer à 100 — on normalise au moment du tirage.
//
// Exemple : un élève "engaged" appuie surtout sur "understand",
//           un élève "struggling" appuie surtout sur "confused" et "help".

const PROFILES = {
  // Élève qui suit bien
  engaged: {
    understand:  70,
    confused:    15,
    overwhelmed:  5,
    help:        10,
  },
  // Élève en difficulté
  struggling: {
    understand:  10,
    confused:    40,
    overwhelmed: 30,
    help:        20,
  },
  // Élève perdu
  lost: {
    understand:   5,
    confused:    25,
    overwhelmed: 50,
    help:        20,
  },
  // Comportement aléatoire uniforme (défaut)
  random: {
    understand:  25,
    confused:    25,
    overwhelmed: 25,
    help:        25,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE INTERNE
// ─────────────────────────────────────────────────────────────────────────────
// On stocke les intervalles actifs dans un Map :
//   sessionId → { intervalId, config }
// Cela empêche de démarrer deux simulations pour la même session.

const activeSimulations = new Map()

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tire un buttonType au sort selon les poids d'un profil.
 *
 * Exemple avec profil "engaged" :
 *   weights = [70, 15, 5, 10]  → total = 100
 *   rand = 73 → tombe dans "confused" (70 < 73 <= 85)
 *
 * @param {string} profileName - clé dans PROFILES
 * @returns {string} buttonType
 */
function pickButtonType(profileName) {
  const profile = PROFILES[profileName] || PROFILES.random
  const buttons = Object.keys(profile)
  const weights = Object.values(profile)

  const total = weights.reduce((sum, w) => sum + w, 0)
  let rand = Math.random() * total

  for (let i = 0; i < buttons.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return buttons[i]
  }

  // Fallback au dernier bouton (sécurité flottants)
  return buttons[buttons.length - 1]
}

/**
 * Choisit un élève au hasard dans la liste.
 * @param {string[]} studentIds
 * @returns {string}
 */
function pickStudent(studentIds) {
  return studentIds[Math.floor(Math.random() * studentIds.length)]
}

// ─────────────────────────────────────────────────────────────────────────────
// FONCTIONS PRINCIPALES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Démarre une simulation automatique pour une session.
 *
 * @param {Object} config
 * @param {string}   config.sessionId           - session à simuler
 * @param {string[]} config.studentIds          - liste des IDs élèves à simuler
 * @param {number}   [config.intervalMs=5000]   - délai entre chaque press (ms)
 * @param {Object}   [config.studentProfiles]   - { studentId: profileName }
 *                                                si absent → profil "random" pour tous
 *
 * @example
 * startSimulation({
 *   sessionId: 'abc123',
 *   studentIds: ['s1', 's2', 's3'],
 *   intervalMs: 3000,
 *   studentProfiles: { s1: 'engaged', s2: 'struggling', s3: 'lost' }
 * })
 */
function startSimulation({ sessionId, studentIds, intervalMs = 5000, studentProfiles = {} }) {
  // Empêcher une double simulation sur la même session
  if (activeSimulations.has(sessionId)) {
    throw new Error(`Une simulation est déjà active pour la session : ${sessionId}`)
  }

  if (!studentIds || studentIds.length === 0) {
    throw new Error('studentIds est requis et ne peut pas être vide')
  }

  console.log(`[Simulation] Démarrage pour session ${sessionId}`)
  console.log(`[Simulation] ${studentIds.length} élève(s) — intervalle ${intervalMs}ms`)

  // Chaque tick : choisit un élève et un bouton, appelle processButtonPress
  const intervalId = setInterval(async () => {
    try {
      const studentId  = pickStudent(studentIds)
      const profile    = studentProfiles[studentId] || 'random'
      const buttonType = pickButtonType(profile)

      await processButtonPress({
        studentId,
        sessionId,
        buttonType,
        source: 'simulated',   // ← toujours "simulated" pour l'auto
      })

      console.log(`[Simulation] ${studentId} → ${buttonType} (profil: ${profile})`)
    } catch (err) {
      // Si la session est terminée pendant la simulation, on stoppe automatiquement
      if (err.message.includes("n'est pas active") || err.message.includes('introuvable')) {
        console.log(`[Simulation] Session ${sessionId} inactive — arrêt automatique`)
        stopSimulation(sessionId)
      } else {
        console.error('[Simulation] Erreur tick :', err.message)
      }
    }
  }, intervalMs)

  // Stocker l'intervalle et la config pour pouvoir l'arrêter
  activeSimulations.set(sessionId, {
    intervalId,
    startedAt: new Date(),
    config: { sessionId, studentIds, intervalMs, studentProfiles },
  })

  return {
    sessionId,
    studentIds,
    intervalMs,
    studentProfiles,
    startedAt: activeSimulations.get(sessionId).startedAt,
  }
}

/**
 * Arrête la simulation d'une session.
 * @param {string} sessionId
 */
function stopSimulation(sessionId) {
  const sim = activeSimulations.get(sessionId)
  if (!sim) {
    throw new Error(`Aucune simulation active pour la session : ${sessionId}`)
  }

  clearInterval(sim.intervalId)
  activeSimulations.delete(sessionId)

  console.log(`[Simulation] Arrêtée pour session ${sessionId}`)
  return { sessionId, stoppedAt: new Date() }
}

/**
 * Simule UNE pression manuelle immédiate.
 * Appelé via POST /api/simulation/press
 * source = "manual" pour distinguer d'une simulation automatique.
 *
 * @param {Object} params
 * @param {string} params.studentId
 * @param {string} params.sessionId
 * @param {string} params.buttonType
 */
async function manualPress({ studentId, sessionId, buttonType }) {
  // processButtonPress fait toute la validation
  const payload = await processButtonPress({
    studentId,
    sessionId,
    buttonType,
    source: 'manual',   // ← distingue du automatique et du vrai IoT
  })

  console.log(`[Simulation] Press manuel — ${studentId} → ${buttonType}`)
  return payload
}

/**
 * Retourne la liste des simulations actives (utile pour debug).
 */
function getActiveSimulations() {
  const result = []
  for (const [sessionId, sim] of activeSimulations.entries()) {
    result.push({
      sessionId,
      startedAt: sim.startedAt,
      config: sim.config,
    })
  }
  return result
}

module.exports = {
  startSimulation,
  stopSimulation,
  manualPress,
  getActiveSimulations,
  PROFILES,   // exporté pour que le controller puisse lister les profils disponibles
}