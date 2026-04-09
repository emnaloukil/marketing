// teacherSocket.js
// Rôle : gérer toute la logique Socket.IO côté teacher.
// Un teacher rejoint la room de sa session et reçoit les updates en temps réel.
//
// Événements entrants (client → serveur) :
//   session:join   { sessionId }  → rejoindre la room, recevoir snapshot initial
//   session:leave  { sessionId }  → quitter la room proprement
//
// Événements sortants (serveur → client) :
//   dashboard:init    snapshot complet au moment du join
//   dashboard:update  nouveau snapshot après chaque button press
//   session:error     message d'erreur si quelque chose échoue

const { getSessionSnapshot } = require("../services/sessionService");

/**
 * registerTeacherSocket
 * À appeler une fois dans server.js en lui passant l'instance io.
 * Configure tous les handlers pour les connexions teacher.
 *
 * @param {import("socket.io").Server} io
 */
function registerTeacherSocket(io) {
  io.on("connection", (socket) => {
    console.log(`[Socket] Nouvelle connexion : ${socket.id}`);

    // ── session:join ──────────────────────────────────────────────────────────
    // Le teacher envoie cet événement dès que son dashboard charge.
    // On le fait rejoindre la room, puis on lui envoie l'état actuel.
    //
    // Côté frontend React, ce sera quelque chose comme :
    //   socket.emit("session:join", { sessionId: "abc123" })
    socket.on("session:join", async ({ sessionId }) => {
      if (!sessionId) {
        socket.emit("session:error", { message: "sessionId manquant" });
        return;
      }

      const room = `session_${sessionId}`;

      try {
        // Le socket rejoint la room Socket.IO dédiée à cette session.
        // Tous les emits vers cette room atteindront ce socket (et les autres teachers
        // éventuellement connectés à la même session).
        await socket.join(room);
        console.log(`[Socket] ${socket.id} a rejoint la room ${room}`);

        // On tente de récupérer le snapshot existant.
        // Si aucune pression de bouton n'a encore eu lieu, il n'y en a pas — c'est ok.
        try {
          const snapshot = await getSessionSnapshot(sessionId);

          // dashboard:init envoie l'état complet au moment de la connexion.
          // Seulement à CE socket, pas à toute la room (emit direct, pas io.to(room))
          socket.emit("dashboard:init", {
            sessionId,
            snapshot,
          });

          console.log(`[Socket] Snapshot initial envoyé à ${socket.id}`);
        } catch {
          // Pas encore de snapshot = la session vient d'être créée, aucun event encore.
          // Ce n'est pas une erreur : le teacher attend simplement le premier appui.
          socket.emit("dashboard:init", {
            sessionId,
            snapshot: null,
            message: "Session démarrée, en attente du premier événement",
          });
        }
      } catch (err) {
        console.error(`[Socket] Erreur session:join :`, err.message);
        socket.emit("session:error", {
          message: "Impossible de rejoindre la session",
        });
      }
    });

    // ── session:leave ─────────────────────────────────────────────────────────
    // Le teacher quitte volontairement la room (fermeture du dashboard, etc.)
    socket.on("session:leave", async ({ sessionId }) => {
      const room = `session_${sessionId}`;
      await socket.leave(room);
      console.log(`[Socket] ${socket.id} a quitté la room ${room}`);
    });

    // ── disconnect ────────────────────────────────────────────────────────────
    // Socket.IO gère automatiquement le nettoyage des rooms à la déconnexion.
    // On logue juste pour le debug.
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Déconnexion ${socket.id} — raison : ${reason}`);
    });
  });
}

module.exports = { registerTeacherSocket };