const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');

const XP_PER_CORRECT = 10;

function normalizeCorrectAnswer(question) {
  const options = Array.isArray(question.options) ? question.options : [];

  if (typeof question.correctAnswer === 'string' && question.correctAnswer.trim()) {
    return question.correctAnswer.trim();
  }

  if (typeof question.answer === 'string') {
    const answer = question.answer.trim();

    if (/^[A-D]$/i.test(answer)) {
      const option = options[answer.toUpperCase().charCodeAt(0) - 65];
      if (option) return option;
    }

    const directMatch = options.find((option) => option === answer || option.startsWith(`${answer})`));
    if (directMatch) return directMatch;
  }

  if (typeof question.correct === 'number' && options[question.correct]) {
    return options[question.correct];
  }

  return options[0] || '';
}

async function createQuizFromAI(data) {
  // data from AI: {title, courseId, questions, difficulty}
  const normalizedQuestions = (data.quiz || data.questions || []).map((question) => ({
    question: question.question,
    options: question.options || [],
    correctAnswer: normalizeCorrectAnswer(question),
    explanation: question.explanation || '',
  }));

  const quiz = new Quiz({
    title: data.title || 'AI Generated Quiz',
    courseId: data.courseId,
    creator: data.studentId, // From frontend context
    questions: normalizedQuestions,
    difficulty: data.difficulty || 'medium'
  });
  await quiz.save();
  return quiz;
}

async function submitQuiz(studentId, quizId, answers) {
  const quiz = await Quiz.findById(quizId).populate('courseId');
  if (!quiz) throw new Error('Quiz not found');

  let score = 0;
  const submittedAnswers = [];
  quiz.questions.forEach((q, index) => {
    const userAnswer = answers.find(a => a.questionIndex === index);
    const isCorrect = userAnswer && userAnswer.selectedOption === q.correctAnswer;
    if (isCorrect) score++;
    submittedAnswers.push({
      questionIndex: index,
      selectedOption: userAnswer ? userAnswer.selectedOption : '',
      isCorrect
    });
  });

  const submission = new QuizSubmission({
    quizId,
    studentId,
    answers: submittedAnswers,
    score,
    maxScore: quiz.questions.length,
    xpEarned: score * XP_PER_CORRECT
  });
  await submission.save();

  return submission;
}

async function getStudentQuizzes(studentId) {
  return await Quiz.find({ creator: studentId }).populate('courseId');
}

async function getQuizSubmissions(studentId) {
  return await QuizSubmission.find({ studentId }).populate('quizId').sort({ createdAt: -1 });
}

module.exports = {
  createQuizFromAI,
  submitQuiz,
  getStudentQuizzes,
  getQuizSubmissions
};

