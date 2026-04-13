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


const sessionSnapshotSchema = new mongoose.Schema(
  {
    sessionId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'ClassSession',
      required: true,
      unique:   true,
    },

    // Score global de la classe (0-100)
    classScore: {
      type:    Number,
      default: 0,
    },

    // Score par élève : { "studentId": 72, "studentId2": 45 }
    studentScores: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},
    },

    classScoreHistory: {
      type:    [Number],
       default: [],
    },

    // Counts par élève : { "studentId": { understand: 3, confused: 1, ... } }
    countsByStudent: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Breakdown : { good: { count, studentIds }, warning: {...}, alert: {...} }
    breakdown: {
      type:    mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Trend : improving / stable_good / stable_bad / degrading / recovering
    trend: {
      type:    String,
      default: null,
    },

    // Recommandations selon la tendance
    recommendations: {
  type:    [mongoose.Schema.Types.Mixed],
  default: [],
},

    // Timestamp du dernier event traité
    lastEventAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('SessionSnapshot', sessionSnapshotSchema)