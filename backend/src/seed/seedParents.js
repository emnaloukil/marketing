// seedParents.js
// Crée 5 parents de test.
// À lancer EN DEUXIÈME — les élèves auront besoin des parentIds.

require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Parent = require('../models/Parent')

const parents = [
  {
    firstName: 'Marie',
    lastName:  'Dupont',
    email:     'marie.dupont@gmail.com',
    phone:     '0601010101',
  },
  {
    firstName: 'Jean',
    lastName:  'Moreau',
    email:     'jean.moreau@gmail.com',
    phone:     '0602020202',
  },
  {
    firstName: 'Isabelle',
    lastName:  'Laurent',
    email:     'isabelle.laurent@gmail.com',
    phone:     '0603030303',
  },
  {
    firstName: 'Karim',
    lastName:  'Benali',
    email:     'karim.benali@gmail.com',
    phone:     '0604040404',
  },
  {
    firstName: 'Nathalie',
    lastName:  'Rousseau',
    email:     'nathalie.rousseau@gmail.com',
    phone:     '0605050505',
  },
]

async function seedParents() {
  await connectDB()

  await Parent.deleteMany({})
  console.log('[Seed] Parents supprimés')

  const inserted = await Parent.insertMany(parents)
  console.log(`[Seed] ${inserted.length} parents insérés :`)
  inserted.forEach(p => console.log(`  → ${p.firstName} ${p.lastName} (${p._id})`))

  await mongoose.disconnect()
  console.log('[Seed] Parents terminé.\n')

  return inserted
}

if (require.main === module) {
  seedParents().catch(err => {
    console.error('[Seed] Erreur parents :', err)
    process.exit(1)
  })
}

module.exports = seedParents