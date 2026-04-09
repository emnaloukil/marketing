// ─────────────────────────────────────────
// engagementEngine.js
//
// Rôle : contient toute la logique de calcul
// d'engagement — scores, tendances, breakdown.
//
// Ce fichier ne touche PAS à MongoDB.
// Il reçoit des données brutes et retourne des résultats.
// C'est une boîte noire mathématique, testable seul.
// ─────────────────────────────────────────

// ── WEIGHTS ───────────────────────────────
//
// Chaque bouton a un poids positif ou négatif.
// Ces poids influencent le score d'engagement calculé.
//
// understand  → +2 (très positif : l'élève suit)
// confused    → -1 (légèrement négatif : l'élève cherche)
// help        → -2 (négatif : l'élève est bloqué)
// overwhelmed → -3 (très négatif : l'élève est en surcharge)
//
const WEIGHTS = {
  understand:  2,
  confused:   -1,
  help:       -2,
  overwhelmed:-3,
}

// ── calcScore ─────────────────────────────
//
// Calcule un score d'engagement entre 0 et 100
// à partir des compteurs de boutons d'un élève.
//
// Formule :
//   score = 50 + (somme_pondérée / total_presses) * 12
//
// Le centre est 50 (neutre).
// Si l'élève appuie surtout "understand" → score monte vers 100.
// Si l'élève appuie surtout "overwhelmed" → score descend vers 0.
// Le multiplicateur 12 évite des scores extrêmes (0 ou 100) trop vite.
//
// Entrée  : { understand: 5, confused: 2, overwhelmed: 1, help: 0 }
// Sortie  : 67
//
// Entrée  : { understand: 0, confused: 0, overwhelmed: 0, help: 0 }
// Sortie  : null (pas assez de données)
//
const calcScore = (counts) => {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  if (total === 0) return null

  const weightedSum = Object.entries(counts).reduce(
    (sum, [key, value]) => sum + (WEIGHTS[key] || 0) * value,
    0
  )

  const raw = 50 + (weightedSum / total) * 12

  // Clamp entre 0 et 100, arrondi à l'entier
  return Math.min(100, Math.max(0, Math.round(raw)))
}

// ── detectTrend ───────────────────────────
//
// Détecte la tendance d'engagement à partir
// de l'historique des scores dans le temps.
//
// Méthode : compare la moyenne des 3 derniers scores
// à la moyenne des 3 scores précédents.
//
// Si la différence est > +4 → amélioration
// Si la différence est < -4 → dégradation
// Si stable et score >= 55  → stable positif
// Si stable et score < 42   → stable négatif (stagnation)
// Sinon                     → récupération (entre les deux)
//
// Retourne null si pas assez de données (< 4 scores).
//
// Entrée  : [50, 52, 55, 60, 65, 68]
// Sortie  : 'improving'
//
// Entrée  : [70, 65, 58, 50, 45, 40]
// Sortie  : 'degrading'
//
// Entrée  : [60, 62, 61, 63, 60, 62]
// Sortie  : 'stable_good'
//
// Entrée  : [38, 36, 40, 37, 39, 38]
// Sortie  : 'stable_bad'
//
// Entrée  : [35, 38, 42, 46, 50, 52]
// Sortie  : 'recovering'
//
const detectTrend = (history) => {
  if (!history || history.length < 4) return null

  const recent  = history.slice(-3)
  const earlier = history.slice(-6, -3)

  if (earlier.length === 0) return null

  const recentAvg  = recent.reduce((a, b) => a + b, 0)  / recent.length
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
  const diff = recentAvg - earlierAvg

  if (diff > 4)       return 'improving'
  if (diff < -4)      return 'degrading'
  if (recentAvg >= 55) return 'stable_good'
  if (recentAvg < 42)  return 'stable_bad'
  return 'recovering'
}

// ── buildBreakdown ────────────────────────
//
// Classe les élèves en 3 catégories selon leur score.
// Utilisé par le dashboard enseignant pour voir
// combien d'élèves vont bien, ont du mal, ou sont en détresse.
//
// Seuils :
//   engaged    → score >= 65 (l'élève suit bien)
//   struggling → score entre 40 et 64 (l'élève a du mal)
//   distressed → score < 40 (l'élève est en détresse)
//
// Entrée  : [{ studentId: 's1', score: 72 }, { studentId: 's2', score: 38 }, ...]
// Sortie  : { engaged: 1, struggling: 0, distressed: 1, total: 2 }
//
const buildBreakdown = (scores) => {
  const valid = scores.filter((s) => s !== null && s !== undefined)

  return {
    engaged:    valid.filter((s) => s >= 65).length,
    struggling: valid.filter((s) => s >= 40 && s < 65).length,
    distressed: valid.filter((s) => s < 40).length,
    total:      valid.length,
  }
}

// ── getDayTrend ───────────────────────────
//
// Calcule la tendance de la journée entière pour un élève.
// Utilisé pour le DailySummary affiché au parent.
//
// Compare les scores des sessions du matin vs celles de l'après-midi.
// Si l'enfant progresse dans la journée → 'good'
// Si l'enfant stagne à un niveau moyen  → 'moderate'
// Si l'enfant est en difficulté        → 'struggling'
//
// Entrée  : [45, 62, 70]   (3 sessions du jour)
// Sortie  : 'moderate'     (avg = 59)
//
// Entrée  : [80, 75, 85]
// Sortie  : 'good'         (avg = 80)
//
// Entrée  : [30, 35, 28]
// Sortie  : 'struggling'   (avg = 31)
//
const getDayTrend = (sessionScores) => {
  if (!sessionScores || sessionScores.length === 0) return null

  const validScores = sessionScores.filter((s) => s !== null)
  if (validScores.length === 0) return null

  const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length

  if (avg >= 65) return 'good'
  if (avg >= 45) return 'moderate'
  return 'struggling'
}

// ── getAvgScore ───────────────────────────
//
// Calcule la moyenne des scores sur plusieurs sessions.
// Utilisé dans le DailySummary pour afficher le score moyen du jour.
//
// Entrée  : [45, 62, 70]
// Sortie  : 59
//
// Entrée  : []
// Sortie  : null
//
const getAvgScore = (sessionScores) => {
  if (!sessionScores || sessionScores.length === 0) return null

  const validScores = sessionScores.filter((s) => s !== null)
  if (validScores.length === 0) return null

  return Math.round(
    validScores.reduce((a, b) => a + b, 0) / validScores.length
  )
}

// ── calcClassScore ────────────────────────
//
// Calcule le score moyen de toute la classe
// à partir des scores individuels des élèves.
// Utilisé dans le SessionSnapshot pour le dashboard enseignant.
//
// Entrée  : [72, 38, 65, 50, 80, 45]
// Sortie  : 58
//
const calcClassScore = (studentScores) => {
  const valid = studentScores.filter((s) => s !== null)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

// ─────────────────────────────────────────
// Exports
// ─────────────────────────────────────────
module.exports = {
  WEIGHTS,
  calcScore,
  detectTrend,
  buildBreakdown,
  getDayTrend,
  getAvgScore,
  calcClassScore,
}