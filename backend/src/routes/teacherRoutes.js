const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");

router.get("/dashboard/:sessionId", teacherController.getDashboard);

module.exports = router;