// ioInstance.js
// Singleton qui stocke l'instance Socket.IO.
// Permet à n'importe quel service d'émettre sans connaître server.js.
//
// Pourquoi un singleton ?
// → server.js crée io, mais sessionService.js en a besoin.
// → Si sessionService importait server.js, on aurait une dépendance circulaire.
// → Ce fichier neutre casse le cycle : tout le monde importe ioInstance,
//   personne n'importe server.js.

let _io = null;

/**
 * Appelé une seule fois dans server.js après création de io.
 * Stocke l'instance pour que tous les services puissent l'utiliser.
 */
function setIO(ioInstance) {
  _io = ioInstance;
}

/**
 * Appelé par n'importe quel service qui veut émettre un événement.
 * Retourne null si io n'est pas encore initialisé (démarrage du serveur).
 */
function getIO() {
  return _io;
}

module.exports = { setIO, getIO };