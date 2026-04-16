const express = require('express');
const router = express.Router();

// TODO: Add student auth middleware
// const { authenticateStudent } = require('../middleware/auth');

const quizCtrl = require('../controllers/quizController');

// POST /api/quiz/create - Create from AI data
router.post('/create', /*authenticateStudent,*/ quizCtrl.createQuiz);

// POST /api/quiz/:quizId/submit - Submit answers
router.post('/:quizId/submit', /*authenticateStudent,*/ quizCtrl.submitQuiz);

// GET /api/quiz/my - Get student's quizzes
router.get('/my', /*authenticateStudent,*/ quizCtrl.getMyQuizzes);

// GET /api/quiz/submissions - Get student's submissions
router.get('/submissions', /*authenticateStudent,*/ quizCtrl.getMySubmissions);

module.exports = router;

