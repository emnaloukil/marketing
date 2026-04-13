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
// engagementEngine.js
// Rôle : toute la logique de calcul d'engagement.
// Ce fichier ne touche PAS à MongoDB.
// Il reçoit des données brutes et retourne des résultats.

// ── WEIGHTS ───────────────────────────────────────────────────────────────────
const WEIGHTS = {
  understand:  2,
  confused:   -1,
  help:       -2,
  overwhelmed: -3,
}

// ── calcScore ─────────────────────────────────────────────────────────────────
//
// Calcule un score d'engagement entre 0 et 100
// à partir des compteurs de boutons d'un élève.
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
  return Math.min(100, Math.max(0, Math.round(raw)))
}

// ── detectTrend ───────────────────────────────────────────────────────────────
//
// Détecte la tendance à partir de l'historique des classScores.
// Retourne null si moins de 4 scores — normal en début de session.
//
// Entrée  : [50, 52, 55, 60, 65, 68]  → 'improving'
// Entrée  : [70, 65, 58, 50, 45, 40]  → 'degrading'
// Entrée  : [60, 62, 61, 63, 60, 62]  → 'stable_good'
// Entrée  : [38, 36, 40, 37, 39, 38]  → 'stable_bad'
// Entrée  : [35, 38, 42, 46, 50, 52]  → 'recovering'
// Entrée  : [50, 52, 55]              → null (pas assez)
//
const detectTrend = (history) => {
  // Sécuriser l'entrée
  const arr = Array.isArray(history) ? history.filter(s => s !== null && s !== undefined) : []

  // Minimum 4 scores pour détecter une tendance
  if (arr.length < 4) return null

  const recent  = arr.slice(-3)
  const earlier = arr.slice(-6, -3)

  if (earlier.length === 0) return null

  const recentAvg  = recent.reduce((a, b) => a + b, 0)  / recent.length
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
  const diff = recentAvg - earlierAvg

  if (diff > 4)        return 'improving'
  if (diff < -4)       return 'degrading'
  if (recentAvg >= 55) return 'stable_good'
  if (recentAvg < 42)  return 'stable_bad'
  return 'recovering'
}

// ── buildBreakdown ────────────────────────────────────────────────────────────
//
// Classe les élèves en 3 catégories selon leur score.
//
// ⚠️  IMPORTANT : attend un tableau de nombres (scores)
//     PAS un objet { studentId: score }
//
// Entrée  : [72, 38, 65, 50, 80]
// Sortie  : { engaged: 2, struggling: 2, distressed: 1, total: 5 }
//
const buildBreakdown = (scores) => {
  // Sécuriser l'entrée — accepte tableau ou objet
  const arr = Array.isArray(scores)
    ? scores
    : Object.values(scores)

  const valid = arr.filter((s) => s !== null && s !== undefined)

  return {
    engaged:    valid.filter((s) => s >= 65).length,
    struggling: valid.filter((s) => s >= 40 && s < 65).length,
    distressed: valid.filter((s) => s < 40).length,
    total:      valid.length,
  }
}

// ── getDayTrend ───────────────────────────────────────────────────────────────
//
// Calcule la tendance de la journée pour un élève.
// Utilisé pour le DailySummary affiché au parent.
//
// Entrée  : [45, 62, 70]  → 'moderate'  (avg = 59)
// Entrée  : [80, 75, 85]  → 'good'      (avg = 80)
// Entrée  : [30, 35, 28]  → 'struggling'(avg = 31)
//
const getDayTrend = (sessionScores) => {
  if (!sessionScores || sessionScores.length === 0) return null

  const validScores = sessionScores.filter((s) => s !== null && s !== undefined)
  if (validScores.length === 0) return null

  const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length

  if (avg >= 65) return 'good'
  if (avg >= 45) return 'moderate'
  return 'struggling'
}

// ── getAvgScore ───────────────────────────────────────────────────────────────
//
// Calcule la moyenne des scores.
// Accepte tableau ou objet { studentId: score }.
//
// Entrée  : [45, 62, 70]  → 59
// Entrée  : []            → null
//
const getAvgScore = (scores) => {
  // Accepte tableau ou objet
  const arr = Array.isArray(scores)
    ? scores
    : Object.values(scores)

  const valid = arr.filter((s) => s !== null && s !== undefined)
  if (valid.length === 0) return null

  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

// ── calcClassScore ────────────────────────────────────────────────────────────
//
// Calcule le score moyen de toute la classe.
//
// Entrée  : [72, 38, 65, 50, 80, 45]  → 58
//
const calcClassScore = (studentScores) => {
  const arr   = Array.isArray(studentScores) ? studentScores : Object.values(studentScores)
  const valid = arr.filter((s) => s !== null && s !== undefined)
  if (valid.length === 0) return null
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  WEIGHTS,
  calcScore,
  detectTrend,
  buildBreakdown,
  getDayTrend,
  getAvgScore,
  calcClassScore,
}