// teacherSocket.js
const { getSessionSnapshot } = require('../services/sessionService')

function registerTeacherSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Nouvelle connexion : ${socket.id}`)

    // ── teacher:joinSession ─────────────────────────────────────────────────
    socket.on('teacher:joinSession', async ({ sessionId }) => {
      if (!sessionId) {
        socket.emit('session:error', { message: 'sessionId manquant' })
        return
      }

      const room = `session_${sessionId}`

      try {
        await socket.join(room)
        console.log(`[Socket] ${socket.id} a rejoint la room ${room}`)

        try {
          const snapshot = await getSessionSnapshot(sessionId)

          socket.emit('dashboard:init', {
            sessionId,
            snapshot,
          })

          console.log(`[Socket] Snapshot initial envoyé à ${socket.id}`)
        } catch {
          socket.emit('dashboard:init', {
            sessionId,
            snapshot: null,
            message: 'Session démarrée, en attente du premier événement',
          })
        }
      } catch (err) {
        console.error('[Socket] Erreur teacher:joinSession :', err.message)
        socket.emit('session:error', {
          message: 'Impossible de rejoindre la session',
        })
      }
    })

    // ── teacher:leaveSession ────────────────────────────────────────────────
    socket.on('teacher:leaveSession', async ({ sessionId }) => {
      if (!sessionId) return

      const room = `session_${sessionId}`

      try {
        await socket.leave(room)
        console.log(`[Socket] ${socket.id} a quitté la room ${room}`)
      } catch (err) {
        console.error('[Socket] Erreur teacher:leaveSession :', err.message)
      }
    })

    // ── disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Déconnexion ${socket.id} — raison : ${reason}`)
    })
  })
}

module.exports = { registerTeacherSocket }