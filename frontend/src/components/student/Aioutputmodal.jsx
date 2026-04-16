import React, { useEffect, useRef, useState } from "react";
import { useStudent } from "../../context/Studentcontext";
import { aiTutorAPI } from "../../api/aiTutorClient";
import { quizAPI } from "../../api/client";
import "./AIOutputModal.css";

function buildLearnerProfile(student) {
  const birthDate = student?.dateOfBirth ? new Date(student.dateOfBirth) : null;
  const now = new Date();
  const hasBirthDate = birthDate instanceof Date && !Number.isNaN(birthDate.getTime());
  const age = hasBirthDate
    ? Math.max(
        3,
        now.getFullYear() -
          birthDate.getFullYear() -
          (now.getMonth() < birthDate.getMonth() ||
          (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate())
            ? 1
            : 0)
      )
    : 9;

  return {
    age,
    level: "beginner",
    language: "en",
    condition: student?.supportProfile || student?.condition || "none",
  };
}

function buildLessonText(course) {
  const parts = [
    `Course title: ${course.title}`,
    course.subject ? `Subject: ${course.subject}` : "",
    course.pages ? `PDF length: ${course.pages} pages` : "",
    course.fileUrl ? `Course file URL: ${course.fileUrl}` : "",
    "Please explain this elementary school lesson clearly.",
  ];

  return parts.filter(Boolean).join("\n");
}

function normalizeQuizOutput(result) {
  if (Array.isArray(result?.quiz)) {
    return {
      quiz: result.quiz,
      questions: result.quiz.map((item) => ({
        question: item.question,
        options: item.options || [],
        correct:
          typeof item.correct === "number"
            ? item.correct
            : (() => {
                const options = item.options || [];
                if (typeof item.correctAnswer === "string") {
                  const correctIndex = options.findIndex((option) => option === item.correctAnswer);
                  if (correctIndex >= 0) return correctIndex;
                }
                if (typeof item.answer === "string") {
                  const answer = item.answer.trim();
                  if (/^[A-D]$/i.test(answer)) {
                    return Math.max(0, answer.toUpperCase().charCodeAt(0) - 65);
                  }
                  const exactIndex = options.findIndex((option) => option === answer || option.startsWith(`${answer})`));
                  if (exactIndex >= 0) return exactIndex;
                }
                return 0;
              })(),
        explanation: item.explanation || "",
      })),
    };
  }

  return result;
}

export default function AIOutputModal({ action, course, onClose }) {
  const { student } = useStudent();
  const [status, setStatus] = useState("loading");
  const [output, setOutput] = useState(null);
  const [quizState, setQuizState] = useState({
    current: 0,
    answers: [],
    showResult: false,
    score: 0,
    xpEarned: 0,
    submitting: false,
    submitError: "",
  });
  const overlayRef = useRef(null);

  useEffect(() => {
    generateContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action.id, course.id]);

  const generateContent = async () => {
    setStatus("loading");
    setQuizState({
      current: 0,
      answers: [],
      showResult: false,
      score: 0,
      xpEarned: 0,
      submitting: false,
      submitError: "",
    });

    const lessonText = buildLessonText(course);
    const learnerProfile = buildLearnerProfile(student);
    const explanationPayload = {
      courseId: course.id,
      courseTitle: course.title,
      content: lessonText,
      courseFileUrl: course.fileUrl || "",
      learnerProfile,
    };

    try {
      let result;

      if (action.id === "explanation") {
        result = await aiTutorAPI.generateExplanation(explanationPayload);
        setOutput({
          text: [
            result.explanation,
            ...(result.keyPoints || []).map((point) => `* ${point}`),
          ].filter(Boolean).join("\n\n"),
        });
      } else if (action.id === "audio") {
        result = await aiTutorAPI.generateAudio({
          text: lessonText,
          language: learnerProfile.language,
          speed: 1.0,
          courseFileUrl: course.fileUrl || "",
        });
        setOutput(result);
      } else if (action.id === "video") {
        const explanationResult = await aiTutorAPI.generateExplanation(explanationPayload);

        try {
          result = await aiTutorAPI.generateVideo({
            text: explanationResult.explanation,
            avatar: "student",
            avatar_gender: "girl",
            duration: null,
            courseTitle: course.title,
            courseFileUrl: course.fileUrl || "",
            learnerProfile,
          });
          setOutput(result);
        } catch (videoError) {
          console.error(videoError);
          setOutput({
            text: [
              "Video generation is unavailable right now, so here is the adapted explanation instead.",
              explanationResult.explanation,
              ...(explanationResult.keyPoints || []).map((point) => `* ${point}`),
            ].filter(Boolean).join("\n\n"),
          });
        }
      } else if (action.id === "quiz") {
        result = await aiTutorAPI.generateQuiz({
          content: lessonText,
          difficulty: "medium",
          numQuestions: 5,
          courseTitle: course.title,
          courseFileUrl: course.fileUrl || "",
        });

        const normalizedQuiz = normalizeQuizOutput(result);
        let persistedQuizId = null;

        if (student?._id && course?.id) {
          try {
            const createdQuiz = await quizAPI.create({
              studentId: student._id,
              courseId: course.id,
              aiQuizData: {
                title: `${course.title} Quiz`,
                difficulty: "medium",
                quiz: result.quiz || normalizedQuiz.questions,
              },
            });
            persistedQuizId = createdQuiz?.quiz?._id || createdQuiz?.quiz?.id || null;
          } catch (persistError) {
            console.error("Quiz persistence error:", persistError);
          }
        }

        setOutput({
          ...normalizedQuiz,
          quizId: persistedQuizId,
          studentId: student?._id || null,
        });
      } else {
        throw new Error("Unsupported AI action");
      }

      setStatus("done");
    } catch (err) {
      console.error(err);
      setOutput({ error: err.message || "AI request failed" });
      setStatus("error");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="ai-modal page-enter">
        <div className="modal-header" style={{ background: action.gradient }}>
          <div className="modal-header-left">
            <div className="modal-action-icon">{action.emoji}</div>
            <div>
              <h2 className="modal-title">{action.label}</h2>
              <p className="modal-subtitle">{course.title}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {status === "loading" && <LoadingState action={action} />}
          {status === "error" && <ErrorState onRetry={generateContent} message={output?.error} />}
          {status === "done" && action.id === "quiz" && (
            <QuizOutput output={output} state={quizState} setState={setQuizState} />
          )}
          {status === "done" && action.id !== "quiz" && <RichOutput output={output} action={action} />}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ action }) {
  return (
    <div className="loading-state">
      <div className="loading-orb" style={{ background: action.gradient }}>
        <div className="spinner" style={{ borderTopColor: "white" }} />
      </div>
      <h3 className="loading-title">Creating your {action.label.toLowerCase()}...</h3>
      <p className="loading-sub">Our AI is reading the lesson for you.</p>
      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function ErrorState({ onRetry, message }) {
  return (
    <div className="error-state">
      <div className="error-emoji">Oops</div>
      <h3>Something went wrong</h3>
      <p>{message || "Our AI couldn't generate the content right now."}</p>
      <button className="btn btn-primary" onClick={onRetry}>Try Again</button>
    </div>
  );
}

function RichOutput({ output, action }) {
  if (output?.audioUrl) {
    return (
      <div className="text-output">
        <div className="output-badge" style={{ background: action.gradient }}>
          {action.emoji} AI Generated
        </div>
        <audio controls src={output.audioUrl} style={{ width: "100%", marginTop: 18 }} />
      </div>
    );
  }

  if (output?.videoUrl) {
    return (
      <div className="text-output">
        <div className="output-badge" style={{ background: action.gradient }}>
          {action.emoji} AI Generated
        </div>
        <video controls src={output.videoUrl} style={{ width: "100%", marginTop: 18, borderRadius: 16 }} />
      </div>
    );
  }

  const text = output?.text || "";

  return (
    <div className="text-output">
      <div className="output-badge" style={{ background: action.gradient }}>
        {action.emoji} AI Generated
      </div>
      <div className="output-content">
        {text.split("\n").map((line, index) =>
          line.trim() ? <p key={index} className="output-para">{line}</p> : <br key={index} />
        )}
      </div>
    </div>
  );
}

function QuizOutput({ output, state, setState }) {
  if (!output?.questions?.length) {
    return <p>Quiz generation failed.</p>;
  }

  const questions = output.questions;
  const { current, answers, showResult, score, xpEarned, submitting, submitError } = state;

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-result">
        <div className="quiz-result-emoji">
          {pct >= 80 ? "A+" : pct >= 60 ? "Good" : "Practice"}
        </div>
        <h3 className="quiz-result-title">
          {pct >= 80 ? "Amazing!" : pct >= 60 ? "Good job!" : "Keep practicing!"}
        </h3>
        <div className="quiz-score-circle">
          <span className="quiz-score-num">{score}/{questions.length}</span>
          <span className="quiz-score-pct">{pct}%</span>
        </div>
        <p className="quiz-counter">XP earned: {xpEarned}</p>
        {submitting && <p className="quiz-counter">Saving your XP...</p>}
        {submitError && <p className="quiz-counter" style={{ color: "#DC2626" }}>{submitError}</p>}
        <div className="quiz-review">
          {questions.map((q, i) => (
            <div key={i} className={`quiz-review-item ${answers[i] === q.correct ? "correct" : "wrong"}`}>
              <span className="review-icon">{answers[i] === q.correct ? "OK" : "NO"}</span>
              <div>
                <div className="review-q">{q.question}</div>
                <div className="review-exp">Tip: {q.explanation}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setState({
            current: 0,
            answers: [],
            showResult: false,
            score: 0,
            xpEarned: 0,
            submitting: false,
            submitError: "",
          })}
        >
          Try Again
        </button>
      </div>
    );
  }

  const q = questions[current];

  const handleAnswer = async (idx) => {
    const nextAnswers = [...answers, idx];
    const nextScore = score + (idx === q.correct ? 1 : 0);

    if (current + 1 >= questions.length) {
      const nextState = {
        current: current + 1,
        answers: nextAnswers,
        showResult: true,
        score: nextScore,
        xpEarned: nextScore * 10,
        submitting: false,
        submitError: "",
      };
      setState(nextState);

      if (output.quizId && output.studentId) {
        setState({ ...nextState, submitting: true });
        try {
          const submissionResult = await quizAPI.submit(output.quizId, {
            quizId: output.quizId,
            studentId: output.studentId,
            answers: nextAnswers.map((answerIndex, questionIndex) => ({
              questionIndex,
              selectedOption: questions[questionIndex]?.options?.[answerIndex] || "",
            })),
          });

          const xpEarnedFromBackend = submissionResult?.submission?.xpEarned ?? nextState.xpEarned;
          const updatedXp = submissionResult?.xp?.xp;

          if (typeof updatedXp === "number") {
            setState({
              ...nextState,
              submitting: false,
              xpEarned: xpEarnedFromBackend,
              submitError: "",
            });

            const stored = localStorage.getItem("ek_user");
            const parsed = stored ? JSON.parse(stored) : {};
            const nextStudent = {
              ...parsed,
              xp: updatedXp,
              totalXp: submissionResult?.xp?.totalXp ?? parsed?.totalXp ?? updatedXp,
            };
            localStorage.setItem("ek_user", JSON.stringify(nextStudent));
            window.dispatchEvent(new CustomEvent("studentUpdated"));
          } else {
            setState({
              ...nextState,
              submitting: false,
              xpEarned: xpEarnedFromBackend,
              submitError: "",
            });
          }
        } catch (error) {
          console.error("Quiz submission error:", error);
          setState({
            ...nextState,
            submitting: false,
            submitError: error.message || "Quiz result saved locally, but XP could not be synced.",
          });
        }
      }
      return;
    }

    setState({
      current: current + 1,
      answers: nextAnswers,
      showResult: false,
      score: nextScore,
      xpEarned: 0,
      submitting: false,
      submitError: "",
    });
  };

  return (
    <div className="quiz-output">
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${(current / questions.length) * 100}%` }}
        />
      </div>
      <div className="quiz-counter">Question {current + 1} of {questions.length}</div>
      <h3 className="quiz-question">{q.question}</h3>
      <div className="quiz-options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className="quiz-option"
            onClick={() => handleAnswer(i)}
          >
            <span className="quiz-option-letter">
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
