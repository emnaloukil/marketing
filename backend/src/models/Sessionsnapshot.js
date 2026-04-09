const mongoose = require('mongoose')

// ─────────────────────────────────────────
// SessionSnapshot.js
//
// Représente l'état LIVE d'une session pour le dashboard enseignant.
// Un snapshot est calculé et mis à jour après chaque ButtonEvent.
// C'est ce document qui est envoyé au frontend via Socket.io.
//
// Pourquoi stocker le snapshot au lieu de le calculer à la volée ?
// → Performance : pas besoin de recalculer tous les ButtonEvents
//   à chaque fois qu'un nouveau client se connecte au dashboard.
// → Le snapshot contient déjà tout ce dont le frontend a besoin.
// ─────────────────────────────────────────

// Sous-schéma : état d'un élève dans la session
const studentStateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Student',
    },
    studentName: String,

    // Compteurs par bouton
    counts: {
      understand:  { type: Number, default: 0 },
      confused:    { type: Number, default: 0 },
      overwhelmed: { type: Number, default: 0 },
      help:        { type: Number, default: 0 },
    },

    totalPresses: { type: Number, default: 0 },

    // Score d'engagement calculé (0-100)
    engagementScore: { type: Number, default: null },

    // Historique des scores — utilisé pour tracer la courbe de tendance
    scoreHistory: [Number],

    // Tendance détectée pour cet élève
    // improving | stable_good | stable_bad | degrading | recovering | null
    trend: { type: String, default: null },
  },
  { _id: false } // pas besoin d'ID pour les sous-documents
)

const sessionSnapshotSchema = new mongoose.Schema(
  {
    // ── Référence session ─────────────────
    sessionId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'ClassSession',
      required: true,
      unique:   true, // un seul snapshot par session
    },

    // ── État de la classe ─────────────────

    // Score moyen de toute la classe (0-100)
    classScore: {
      type:    Number,
      default: null,
    },

    // Historique du score classe — pour la ligne de tendance
    classScoreHistory: {
      type:    [Number],
      default: [],
    },

    // Tendance détectée pour la classe entière
    classTrend: {
      type:    String,
      default: null,
    },

    // Breakdown : combien d'élèves dans chaque état
    breakdown: {
      engaged:    { type: Number, default: 0 },
      struggling: { type: Number, default: 0 },
      distressed: { type: Number, default: 0 },
      total:      { type: Number, default: 0 },
    },

    // Recommandations générées pour l'enseignant
    recommendations: [
      {
        type:    String, // ex: 'pedagogique', 'urgent', 'emotionnelle'
        message: String,
      },
    ],

    // ── État par élève ────────────────────
    students: [studentStateSchema],

    // ── Timing ────────────────────────────
    lastUpdatedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('SessionSnapshot', sessionSnapshotSchema)