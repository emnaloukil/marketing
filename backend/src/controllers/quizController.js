const quizService = require('../services/quizService');
const xpService = require('../services/xpService');
const streakService = require('../services/streakService');

async function createQuiz(req, res) {
  try {
    const { aiQuizData, courseId } = req.body; // {title, quiz: questions[], difficulty}
    const studentId = req.studentId || req.body.studentId; // Fallback while auth middleware is not wired
    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }
    if (!aiQuizData || !courseId) {
      return res.status(400).json({ error: 'aiQuizData and courseId are required' });
    }
    aiQuizData.courseId = courseId;
    const quiz = await quizService.createQuizFromAI({ ...aiQuizData, studentId });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function submitQuiz(req, res) {
  try {
    const quizId = req.params.quizId || req.body.quizId;
    const { answers } = req.body;
    const studentId = req.studentId || req.body.studentId;
    if (!quizId || !studentId || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'quizId, studentId and answers are required' });
    }
    const submission = await quizService.submitQuiz(studentId, quizId, answers);
    // Award XP
    const xp = await xpService.awardXp(studentId, submission.xpEarned);
    // Update streak
    await streakService.updateStreak(studentId);
    res.json({ success: true, submission, xp, message: 'Quiz submitted! XP awarded.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getMyQuizzes(req, res) {
  try {
    const studentId = req.studentId;
    const quizzes = await quizService.getStudentQuizzes(studentId);
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMySubmissions(req, res) {
  try {
    const studentId = req.studentId;
    const submissions = await quizService.getQuizSubmissions(studentId);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createQuiz,
  submitQuiz,
  getMyQuizzes,
  getMySubmissions
};

