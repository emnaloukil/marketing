const mongoose = require('mongoose')

// ─────────────────────────────────────────
// Parent.js
//
// Représente un parent dans le système.
// Un parent peut avoir plusieurs enfants (students).
// Il accède au résumé journalier de chaque enfant.
// ─────────────────────────────────────────

const parentSchema = new mongoose.Schema(
  {
    // ── Identité ──────────────────────────
    firstName: {
      type:     String,
      required: true,
      trim:     true,
    },
    lastName: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    phone: {
      type:     String,
      required: false, // optionnel pour le MVP
    },

    // ── Enfants ───────────────────────────
    // Références vers les Students associés à ce parent
    
    // ── Auth ──────────────────────────────
    // Mot de passe hashé (sera géré dans une prochaine étape)
    password: {
      type:   String,
      select: false, // ne jamais retourner le mot de passe dans les queries
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatiques
  }
)

// Champ virtuel : nom complet
parentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model('Parent', parentSchema)