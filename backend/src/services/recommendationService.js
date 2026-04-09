// ─────────────────────────────────────────
// recommendationService.js
//
// Rôle : retourner les recommandations pour l'enseignant
// selon la tendance détectée par engagementEngine.
//
// Ce fichier ne touche PAS à MongoDB.
// Il reçoit une tendance (string) et retourne
// un tableau de recommandations prêtes à afficher.
//
// Séparation claire :
//   engagementEngine → calcule QUOI (tendance)
//   recommendationService → décide QUOI FAIRE (recommandations)
// ─────────────────────────────────────────

// ── RECOMMENDATIONS ───────────────────────
//
// Chaque clé correspond à une tendance détectée.
// Chaque tableau contient 1 à 3 recommandations ordonnées par priorité.
// La première est toujours la plus importante.
//
// type  → catégorie de la recommandation (pour la couleur dans le dashboard)
// message → texte affiché à l'enseignant (clair, court, actionnable)
//
const RECOMMENDATIONS = {

  // ── Amélioration ──────────────────────
  // La classe progresse → encourager et maintenir
  improving: [
    {
      type:    'pedagogique',
      message: 'The class is improving — maintain the current pace and consider a slight difficulty increase.',
    },
    {
      type:    'encouragement',
      message: 'Celebrate the class progress openly — positive reinforcement boosts group motivation.',
    },
  ],

  // ── Stable positif ────────────────────
  // La classe va bien et est stable → continuer
  stable_good: [
    {
      type:    'pedagogique',
      message: 'The class is consistently engaged. Keep the current approach — it is working well.',
    },
  ],

  // ── Stable négatif (stagnation) ───────
  // La classe est bloquée à un niveau bas → changer d'approche
  stable_bad: [
    {
      type:    'pedagogique',
      message: 'Most students are stuck. Try a different teaching method or a more interactive activity.',
    },
    {
      type:    'approche',
      message: 'Consider a group activity or peer learning — students helping each other can break the stagnation.',
    },
  ],

  // ── Dégradation ───────────────────────
  // La classe se dégrade → intervention immédiate
  degrading: [
    {
      type:    'urgent',
      message: 'The class is struggling. Stop the current activity and offer a short break immediately.',
    },
    {
      type:    'difficulte',
      message: 'The content is too difficult. Reduce difficulty and restart with a simpler version.',
    },
    {
      type:    'emotionnelle',
      message: 'Address the class collectively — normalize struggle and encourage students to keep trying together.',
    },
  ],

  // ── Récupération ──────────────────────
  // La classe remonte après une période difficile → maintenir le cap
  recovering: [
    {
      type:    'pedagogique',
      message: 'The class is recovering. Maintain the reduced difficulty a bit longer before increasing again.',
    },
    {
      type:    'encouragement',
      message: 'Acknowledge the effort of the class — they pushed through a difficult moment together.',
    },
  ],
}

// ── PARENT_ADVICE ─────────────────────────
//
// Conseils affichés au parent dans le DailySummary.
// Générés selon la tendance de la journée de l'enfant.
// Personnalisés avec le prénom de l'enfant.
//
const PARENT_ADVICE = {
  good: (firstName) =>
    `${firstName} had a great day today. Ask them what they learned — it reinforces their confidence.`,

  moderate: (firstName) =>
    `${firstName} had some difficulties today. Encourage them and avoid homework revision this evening.`,

  struggling: (firstName) =>
    `${firstName} had a tough day. Offer rest and emotional support this evening — no academic pressure.`,
}

// ── getRecommendations ────────────────────
//
// Retourne les recommandations pour l'enseignant
// selon la tendance de la classe.
//
// Entrée  : 'degrading'
// Sortie  : [
//   { type: 'urgent',       message: 'Stop the current activity...' },
//   { type: 'difficulte',   message: 'The content is too difficult...' },
//   { type: 'emotionnelle', message: 'Address the class collectively...' }
// ]
//
// Entrée  : null
// Sortie  : []   (pas assez de données pour une recommandation)
//
const getRecommendations = (trend) => {
  if (!trend) return []
  return RECOMMENDATIONS[trend] || []
}

// ── getParentAdvice ───────────────────────
//
// Retourne le conseil du soir pour le parent.
//
// Entrée  : 'good', 'Amine'
// Sortie  : "Amine had a great day today. Ask them what they learned..."
//
// Entrée  : null, 'Sara'
// Sortie  : null
//
const getParentAdvice = (dayTrend, firstName) => {
  if (!dayTrend || !firstName) return null
  const adviceFn = PARENT_ADVICE[dayTrend]
  if (!adviceFn) return null
  return adviceFn(firstName)
}

// ── getTrendLabel ─────────────────────────
//
// Retourne un label lisible pour la tendance.
// Utilisé pour les logs et messages d'état.
//
// Entrée  : 'stable_bad'
// Sortie  : 'Stagnation'
//
const getTrendLabel = (trend) => {
  const labels = {
    improving:   'Improving',
    stable_good: 'Stable — engaged',
    stable_bad:  'Stagnation',
    degrading:   'Degrading',
    recovering:  'Recovering',
  }
  return labels[trend] || 'Unknown'
}

// ─────────────────────────────────────────
// Exports
// ─────────────────────────────────────────
module.exports = {
  RECOMMENDATIONS,
  PARENT_ADVICE,
  getRecommendations,
  getParentAdvice,
  getTrendLabel,
}