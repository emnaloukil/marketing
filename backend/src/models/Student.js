const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const studentSchema = new mongoose.Schema(
  {
    // ── Identité ──────────────────────────────────────────────────────────────
    firstName: {
      type:     String,
      required: [true, 'firstName est requis'],
      trim:     true,
    },
    lastName: {
      type:     String,
      required: [true, 'lastName est requis'],
      trim:     true,
    },

    // ── Liens ─────────────────────────────────────────────────────────────────
    parent: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Parent',
      required: [true, 'parent est requis'],
    },
    classId: {
      type:     String,
      required: [true, 'classId est requis'],
      trim:     true,
    },

    // ── Profil ────────────────────────────────────────────────────────────────
    supportProfile: {
      type:    String,
      enum:    {
        values:  ['none', 'adhd', 'autism', 'dyslexia'],
        message: '{VALUE} n\'est pas un profil valide',
      },
      default: 'none',
    },
    dateOfBirth: {
      type:     Date,
      required: [true, 'dateOfBirth est requise'],
    },

    // ── Accès enfant ──────────────────────────────────────────────────────────
    // studentCode : identifiant unique lisible (ex: STU-A3K9)
    // Obligatoire et unique — pas de sparse car toujours renseigné à la création
    studentCode: {
      type:     String,
      required: [true, 'studentCode est requis'],
      unique:   true,
      trim:     true,
      uppercase: true,
    },

    // pin : hashé avec bcrypt — jamais retourné par défaut
    pin: {
      type:     String,
      required: [true, 'pin est requis'],
      select:   false,
    },
  },
  {
    timestamps: true,
  }
)

// ── Index ─────────────────────────────────────────────────────────────────────
studentSchema.index({ parent:  1 })
studentSchema.index({ classId: 1 })

// ── Hook pre('save') — hash du PIN ────────────────────────────────────────────
// Utilise async sans next — Mongoose supporte les promesses nativement
studentSchema.pre('save', async function () {
  if (!this.isModified('pin')) return
  const salt = await bcrypt.genSalt(12)
  this.pin   = await bcrypt.hash(this.pin, salt)
})

// ── Méthode comparePIN ────────────────────────────────────────────────────────
studentSchema.methods.comparePIN = async function (candidatePIN) {
  return bcrypt.compare(String(candidatePIN), this.pin)
}

// ── Constante statique ────────────────────────────────────────────────────────
studentSchema.statics.SUPPORT_PROFILES = ['none', 'adhd', 'autism', 'dyslexia']
// Empêche le doublon au niveau MongoDB aussi
studentSchema.index(
  { parent: 1, firstName: 1, lastName: 1, dateOfBirth: 1 },
  {
    unique: true,
    name:   'unique_child_per_parent',
  }
)

module.exports = mongoose.model('Student', studentSchema)