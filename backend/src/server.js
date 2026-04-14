require('dotenv').config()

const http    = require('http')
const { Server } = require('socket.io')
const app     = require('./app')
const connectDB = require('./config/db')
const { setIO } = require('./sockets/ioInstance')
const { registerTeacherSocket } = require('./sockets/teacherSocket')
const { scheduleDailySummaryJob } = require('./jobs/generateDailySummaries')

// ─────────────────────────────────────────
// server.js — Entry point
//
// Rôle : démarrer le serveur HTTP + Socket.IO.
// Ordre important :
//   1. connectDB()              → MongoDB prêt
//   2. http.createServer(app)   → serveur HTTP
//   3. new Server(httpServer)   → Socket.IO attaché au même serveur
//   4. setIO(io)                → singleton disponible pour les services
//   5. registerTeacherSocket()  → handlers connexion/join/update
//   6. server.listen()          → tout démarre
// ─────────────────────────────────────────

const PORT       = process.env.PORT       || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'

const start = async () => {
  // ── 1. MongoDB ──────────────────────────────────────────────────────────
  await connectDB()

  // ── 2. Serveur HTTP ─────────────────────────────────────────────────────
  // Socket.IO a besoin du serveur HTTP brut, pas de l'app Express seule.
  const server = http.createServer(app)

  // ── 3. Socket.IO ────────────────────────────────────────────────────────
  const io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  })
  // Après : const io = new Server(server, { ... })
app.set('io', io)   // ← permet aux controllers d'accéder à io via req.app.get('io')

  // ── 4. Singleton ─────────────────────────────────────────────────────────
  // Stocke io AVANT d'enregistrer les handlers,
  // pour que processButtonPress puisse émettre dès le premier event.
  setIO(io)

  // ── 5. Handlers Socket.IO ────────────────────────────────────────────────
  registerTeacherSocket(io)

  scheduleDailySummaryJob()

  // ── 6. Démarrage ─────────────────────────────────────────────────────────
  server.listen(PORT, () => {
    console.log('==========================================')
    console.log(`  EduKids API running on port ${PORT}`)
    console.log(`  http://localhost:${PORT}`)
    console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`)
    console.log(`  Socket.IO   : actif`)
    console.log(`  CORS origin : ${CLIENT_URL}`)
    console.log('==========================================')
  })

  // ── Graceful shutdown ────────────────────────────────────────────────────
  // Ferme proprement HTTP + Socket.IO sur Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...')

    // On ferme io en premier pour couper les connexions WS proprement
    io.close(() => {
      console.log('  Socket.IO fermé.')
    })

    server.close(() => {
      console.log('  Serveur HTTP fermé.')
      process.exit(0)
    })
  })
}

start()