// seedTeachers.js
// Crée 2 teachers de test en base.
// À lancer EN PREMIER — les sessions ont besoin d'un teacherId.

require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Teacher = require('../models/Teacher')

const teachers = [
  {
    firstName: 'Sophie',
    lastName:  'Marchand',
    email:     'sophie.marchand@edukids.fr',
  },
  {
    firstName: 'Thomas',
    lastName:  'Bertin',
    email:     'thomas.bertin@edukids.fr',
  },
]

async function seedTeachers() {
  await connectDB()

  await Teacher.deleteMany({})
  console.log('[Seed] Teachers supprimés')

  const inserted = await Teacher.insertMany(teachers)
  console.log(`[Seed] ${inserted.length} teachers insérés :`)
  inserted.forEach(t => console.log(`  → ${t.firstName} ${t.lastName} (${t._id})`))

  await mongoose.disconnect()
  console.log('[Seed] Teachers terminé.\n')

  return inserted  // utilisé par seedAll.js
}

// Exécution directe : node src/seed/seedTeachers.js
if (require.main === module) {
  seedTeachers().catch(err => {
    console.error('[Seed] Erreur teachers :', err)
    process.exit(1)
  })
}

module.exports = seedTeachers