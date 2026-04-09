const mongoose = require('mongoose')

// ─────────────────────────────────────────
// Teacher.js
//
// Représente un enseignant.
// Un enseignant peut gérer plusieurs classes (ClassSessions).
// Il voit le dashboard live pendant les sessions.
// ─────────────────────────────────────────

const teacherSchema = new mongoose.Schema(
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
    // ── Auth ──────────────────────────────
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },

    password: {
      type:   String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model('Teacher', teacherSchema)