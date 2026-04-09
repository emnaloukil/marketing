const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.post("/button-press", eventController.buttonPress);
router.get("/session/:sessionId", eventController.getBySession);

module.exports = router;