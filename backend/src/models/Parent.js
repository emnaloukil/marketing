// Parent.js
// Modifications ajoutées :
//   - champ email (unique, requis)
//   - champ password (hashé avant sauvegarde)
//   - hook pre('save') pour le hash bcrypt
//   - méthode comparePassword pour le login

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const parentSchema = new mongoose.Schema(
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
      type:      String,
      required:  [true, 'password est requis'],
      minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
      select:    false,   // jamais retourné par défaut
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)




parentSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// ── Méthode comparePassword ───────────────────────────────────────────────────
parentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('Parent', parentSchema)