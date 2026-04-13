const mongoose = require('mongoose')

// ─────────────────────────────────────────
// ButtonEvent.js
//
// Représente UN appui sur un bouton par un élève.
// C'est l'événement atomique du système — tout part de là.
// Chaque appui génère un ButtonEvent qui est ensuite
// utilisé pour calculer les scores et tendances.
//
// source permet de savoir d'où vient l'événement :
//   - 'simulated' → généré automatiquement par le backend (maintenant)
//   - 'iot'       → vient du vrai bouton physique IoT (plus tard)
//   - 'manual'    → entré manuellement par l'enseignant
// ─────────────────────────────────────────

const buttonEventSchema = new mongoose.Schema(
  {
    // ── Qui a appuyé ──────────────────────
    studentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Student',
      required: true,
    },

    // ── Dans quelle session ───────────────
    sessionId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'ClassSession',
      required: true,
    },

    // ── Quel bouton ───────────────────────
    buttonType: {
      type:     String,
      required: true,
      enum:     ['understand', 'confused', 'overwhelmed', 'help'],
    },

    // ── D'où vient l'événement ────────────
    // Clé pour la future migration IoT :
    // quand les vrais boutons arrivent, on change juste source = 'iot'
    // sans toucher au reste du code
    source: {
      type:     String,
      required: true,
      default:  'simulated',
      enum:     ['simulated', 'iot', 'manual'],
    },

    // ── Quand ─────────────────────────────
    timestamp: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    // On désactive updatedAt car un ButtonEvent est immuable —
    // on ne modifie jamais un appui de bouton après création
    timestamps: { createdAt: true, updatedAt: false },
  }
)

// Index pour accélérer les queries les plus fréquentes
buttonEventSchema.index({ sessionId: 1, timestamp: 1 })
buttonEventSchema.index({ studentId: 1, sessionId: 1 })
buttonEventSchema.index({ sessionId: 1, buttonType: 1 })

module.exports = mongoose.model('ButtonEvent', buttonEventSchema)