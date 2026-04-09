require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const ClassSession = require('../models/Classsession')
const Teacher = require('../models/Teacher')
const Student = require('../models/Student')

async function seedSessions() {
  await connectDB()

  const teacher = await Teacher.findOne({}).lean()
  if (!teacher) {
    throw new Error("Aucun teacher en base — lance seedTeachers.js d'abord")
  }

  const classId = 'classe-cm2-a'

  const students = await Student.find({ classId }).lean()
  if (students.length === 0) {
    throw new Error("Aucun élève en base — lance seedStudents.js d'abord")
  }

  const studentIds = students.map(s => s._id)

  await ClassSession.deleteMany({})
  console.log('[Seed] Sessions supprimées')

  const sessions = [
    {
      subject: 'mathematics',
      teacher: teacher._id,
      classId: classId,
      students: studentIds,
      status: 'active',
      startedAt: new Date(),
    },
    {
      subject: 'reading',
      teacher: teacher._id,
      classId: classId,
      students: studentIds,
      status: 'ended',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ]

  const inserted = await ClassSession.insertMany(sessions)
  console.log(`[Seed] ${inserted.length} sessions insérées :`)
  inserted.forEach(s =>
    console.log(`  → [${s.status.toUpperCase()}] "${s.subject}" (${s._id})`)
  )

  const active = inserted.find(s => s.status === 'active')
  if (active) {
    console.log('\n  ┌─────────────────────────────────────────────────┐')
    console.log(`  │  SESSION ACTIVE ID : ${active._id}  │`)
    console.log('  │  Copie cet ID pour tester le dashboard teacher  │')
    console.log('  └─────────────────────────────────────────────────┘')

    console.log('\n  IDs élèves pour la simulation :')
    students.forEach(s =>
      console.log(`    "${s._id}"  ← ${s.firstName} (${s.supportProfile})`)
    )
  }

  await mongoose.disconnect()
  console.log('\n[Seed] Sessions terminé.\n')

  return inserted
}

if (require.main === module) {
  seedSessions().catch(err => {
    console.error('[Seed] Erreur sessions :', err)
    process.exit(1)
  })
}

module.exports = seedSessions