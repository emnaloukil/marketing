// Teacher.js
// Modifications ajoutées :
//   - champ email (unique, requis)
//   - champ password (hashé avant sauvegarde)
//   - hook pre('save') pour le hash bcrypt
//   - méthode comparePassword pour le login

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const teacherSchema = new mongoose.Schema(
  {
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
    email: {
      type:      String,
      required:  [true, 'email est requis'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Format email invalide'],
    },
    password: {
      type:     String,
      required: [true, 'password est requis'],
      minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
      // select: false → le password n'est JAMAIS retourné dans les requêtes
      // sauf si on le demande explicitement avec .select('+password')
      select:   false,
    },
  },
  {
    timestamps: true,
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// HOOK pre('save') — hash du mot de passe
// ─────────────────────────────────────────────────────────────────────────────
// S'exécute automatiquement avant chaque .save()
// Condition isModified : évite de re-hasher si on modifie autre chose
// (ex: changer school ne doit pas re-hasher le password)

teacherSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// ─────────────────────────────────────────────────────────────────────────────
// MÉTHODE comparePassword
// ─────────────────────────────────────────────────────────────────────────────
// Utilisée dans authController pour vérifier le mot de passe au login.
// On l'attache au document (this = l'instance Teacher).
//
// Pourquoi une méthode sur le modèle plutôt que dans le controller ?
// → La logique de comparaison reste couplée au modèle qui la concerne.
// → Le controller reste simple : il appelle juste teacher.comparePassword()

teacherSchema.methods.comparePassword = async function (candidatePassword) {
  // bcrypt.compare compare le mot de passe en clair avec le hash en base
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('Teacher', teacherSchema)