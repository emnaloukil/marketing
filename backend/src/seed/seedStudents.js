require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Student = require('../models/Student')
const Parent = require('../models/Parent')

async function seedStudents() {
  await connectDB()

  const parents = await Parent.find({}).lean()
  if (parents.length === 0) {
    throw new Error("Aucun parent en base — lance seedParents.js d'abord")
  }

  const p = (i) => parents[i % parents.length]._id

  await Student.deleteMany({})
  console.log('[Seed] Students supprimés')

  const students = [
    {
      firstName: 'Lucas',
      lastName: 'Dupont',
      dateOfBirth: new Date('2014-03-12'),
      classId: 'classe-cm2-a',
      parent: p(0),
      supportProfile: 'none',
    },
    {
      firstName: 'Emma',
      lastName: 'Moreau',
      dateOfBirth: new Date('2014-07-25'),
      classId: 'classe-cm2-a',
      parent: p(1),
      supportProfile: 'adhd',
    },
    {
      firstName: 'Noah',
      lastName: 'Laurent',
      dateOfBirth: new Date('2013-11-08'),
      classId: 'classe-cm2-a',
      parent: p(2),
      supportProfile: 'dyslexia',
    },
    {
      firstName: 'Léa',
      lastName: 'Benali',
      dateOfBirth: new Date('2014-01-30'),
      classId: 'classe-cm2-a',
      parent: p(3),
      supportProfile: 'autism',
    },
    {
      firstName: 'Hugo',
      lastName: 'Rousseau',
      dateOfBirth: new Date('2014-05-17'),
      classId: 'classe-cm2-a',
      parent: p(4),
      supportProfile: 'none',
    },
    {
      firstName: 'Chloé',
      lastName: 'Dupont',
      dateOfBirth: new Date('2013-09-03'),
      classId: 'classe-cm2-a',
      parent: p(0),
      supportProfile: 'dyslexia',
    },
  ]
  console.log("Champs du schéma détectés :", Object.keys(Student.schema.paths));
  const inserted = await Student.insertMany(students)
  console.log(`[Seed] ${inserted.length} élèves insérés :`)
  inserted.forEach(s =>
    console.log(`  → ${s.firstName} ${s.lastName} | profil: ${s.supportProfile} (${s._id})`)
  )

  await mongoose.disconnect()
  console.log('[Seed] Students terminé.\n')

  return inserted
}

if (require.main === module) {
  seedStudents().catch(err => {
    console.error('[Seed] Erreur students :', err)
    process.exit(1)
  })
}

module.exports = seedStudents