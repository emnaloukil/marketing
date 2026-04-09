const mongoose = require('mongoose')

// ─────────────────────────────────────────
// Student.js
//
// Représente un élève dans le système.
// Lié à un parent et éventuellement à un enseignant.
// Ses boutons pressés en classe génèrent des ButtonEvents.
// ─────────────────────────────────────────

const studentSchema = new mongoose.Schema(
  {
    // ── Identité ──────────────────────────
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },

    // ── Classe ────────────────────────────
    classId: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Profil de support ─────────────────
    // Une seule option choisie dans le formulaire au début
    supportProfile: {
      type: String,
      enum: ['none', 'adhd', 'autism', 'dyslexia'],
      default: 'none',
    },

    // ── Relations ─────────────────────────
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Champ virtuel : nom complet
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model('Student', studentSchema)