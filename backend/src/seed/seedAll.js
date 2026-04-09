// seedAll.js
// Script central : exécute tous les seeds dans le bon ordre.
// Lance avec : node src/seed/seedAll.js
//
// Ordre obligatoire :
//   1. Teachers  (pas de dépendance)
//   2. Parents   (pas de dépendance)
//   3. Students  (dépend de Parents)
//   4. Sessions  (dépend de Teachers + Students)
//
// Note : chaque seed gère sa propre connexion/déconnexion MongoDB.
// seedAll les appelle en séquence avec await pour garantir l'ordre.

require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')

// Import des seeds (ils exportent leur fonction principale)
const seedTeachers = require('./seedTeachers')
const seedParents  = require('./seedParents')
const seedStudents = require('./seedStudents')
const seedSessions = require('./seedSessions')

async function seedAll() {
  console.log('╔══════════════════════════════════════╗')
  console.log('║     EduKids — Seed complet           ║')
  console.log('╚══════════════════════════════════════╝\n')

  // Chaque seed ouvre et ferme sa propre connexion.
  // On les appelle en séquence stricte.
  await seedTeachers()
  await seedParents()
  await seedStudents()
  await seedSessions()

  console.log('╔══════════════════════════════════════╗')
  console.log('║     Seed complet terminé ✅           ║')
  console.log('╚══════════════════════════════════════╝')
}

seedAll().catch(err => {
  console.error('[SeedAll] Erreur fatale :', err)
  process.exit(1)
})