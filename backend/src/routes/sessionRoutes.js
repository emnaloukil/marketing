const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");

// IMPORTANT : la route /active/:classId doit être AVANT /:id
// sinon Express interpréterait "active" comme un :id
router.get("/active/:classId", sessionController.getActive);
router.get("/:id", sessionController.getById);
router.post("/start", sessionController.start);
router.post("/:id/end", sessionController.end);

module.exports = router;