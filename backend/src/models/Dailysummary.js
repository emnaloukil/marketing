const mongoose = require('mongoose')

// ─────────────────────────────────────────
// DailySummary.js
//
// Résumé journalier d'un élève — affiché au parent.
// Généré automatiquement à la fin de la journée scolaire
// en agrégeant toutes les sessions du jour.
//
// Un DailySummary = un élève + un jour.
// Contient tout ce que le parent a besoin de voir :
// score moyen, tendance du jour, détail par matière,
// boutons pressés au total, et conseil pour le soir.
// ─────────────────────────────────────────

// Sous-schéma : résumé d'une session dans la journée
const sessionSummarySchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'ClassSession',
    },
    subject:          String,   // 'mathematics', 'reading', 'sciences'
    startedAt:        Date,
    endedAt:          Date,
    engagementScore:  Number,   // score de l'élève pour cette session
    trend:            String,   // tendance de l'élève dans cette session
  },
  { _id: false }
)

const dailySummarySchema = new mongoose.Schema(
  {
    // ── Qui ───────────────────────────────
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },
    parentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Parent',
      required: true,
    },

    // ── Quand ─────────────────────────────
    // Format YYYY-MM-DD — clé unique par élève par jour
    date: {
      type:     String,
      required: true,
    },

    // ── Résumé global de la journée ───────

    // Score moyen sur toutes les sessions du jour
    avgEngagementScore: {
      type:    Number,
      default: null,
    },

    // Tendance générale de la journée
    // 'good' | 'moderate' | 'struggling'
    dayTrend: {
      type:    String,
      default: null,
      enum:    ['good', 'moderate', 'struggling', null],
    },

    // Nombre total de sessions dans la journée
    totalSessions: {
      type:    Number,
      default: 0,
    },

    // ── Détail par session ────────────────
    // Une entrée par matière vue dans la journée
    sessions: [sessionSummarySchema],

    // ── Boutons pressés au total ──────────
    // Agrégation de tous les ButtonEvents de la journée
    totalCounts: {
      understand:  { type: Number, default: 0 },
      confused:    { type: Number, default: 0 },
      overwhelmed: { type: Number, default: 0 },
      help:        { type: Number, default: 0 },
    },
    totalPresses: {
      type:    Number,
      default: 0,
    },

    // ── Conseil pour les parents ──────────
    // Généré automatiquement selon dayTrend
    parentAdvice: {
      type:    String,
      default: null,
    },

    // ── Statut de génération ──────────────
    // pending  → résumé pas encore généré
    // ready    → résumé calculé et disponible pour le parent
    status: {
      type:    String,
      default: 'pending',
      enum:    ['pending', 'ready'],
    },

    // Quand le résumé a été généré
    generatedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Index pour accélérer les queries parent
dailySummarySchema.index({ studentId: 1, date: 1 }, { unique: true })
dailySummarySchema.index({ parentId: 1, date: 1 })

module.exports = mongoose.model('DailySummary', dailySummarySchema)