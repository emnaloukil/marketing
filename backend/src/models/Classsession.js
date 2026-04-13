// ClassSession.js
// Représente une session de classe démarrée par un teacher.
// Une seule session active par classe à la fois — enforced au niveau DB (index unique partiel)
// et au niveau service (vérification avant création).

const mongoose = require('mongoose')

const classSessionSchema = new mongoose.Schema(
  {
    // ── Qui ───────────────────────────────────────────────────────────────────
    teacherId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Teacher',
      required: [true, 'teacherId est requis'],
    },

    // ── Quelle classe ─────────────────────────────────────────────────────────
    classId: {
      type:     String,
      required: [true, 'classId est requis'],
      trim:     true,
    },

    // ── Quelle matière ────────────────────────────────────────────────────────
    subject: {
      type:     String,
      required: [true, 'subject est requis'],
      enum:     {
        values:  ['mathematics', 'reading', 'sciences'],
        message: '{VALUE} n\'est pas une matière valide. Valeurs : mathematics, reading, sciences',
      },
    },

    // ── Statut ────────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['planned', 'active', 'ended'],
      default: 'active',   // une session créée via /start est immédiatement active
    },

    // ── Timestamps métier ─────────────────────────────────────────────────────
    startedAt: {
      type:    Date,
      default: Date.now,
    },
    endedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,  // createdAt + updatedAt gérés par Mongoose
  }
)

// ── Index unique partiel ───────────────────────────────────────────────────────
// Garantit qu'une classe ne peut avoir qu'UNE seule session active en base.
// "partiel" = l'unicité ne s'applique que quand status === 'active'.
// Quand la session passe à 'ended', la contrainte ne s'applique plus
// → le teacher peut redémarrer une session pour la même classe.
classSessionSchema.index(
  { teacherId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'unique_active_session_per_teacher',
  }
)

module.exports = mongoose.model('ClassSession', classSessionSchema)