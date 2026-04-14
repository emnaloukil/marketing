import React, { useState, useEffect, useRef } from "react";
import { useStudent } from "../../context/Studentcontext";
import "./AIOutputModal.css";

const SYSTEM_PROMPTS = {
  explanation: (condition) => `You are EduKids AI, a friendly tutor for elementary school children.
${condition === "dyslexia" ? "Use very short sentences. Use bullet points. Avoid complex words." : ""}
${condition === "adhd" ? "Be energetic! Use emojis. Break content into tiny chunks. Add ⚡ before key facts." : ""}
${condition === "autism" ? "Be clear and literal. Avoid metaphors. Use numbered steps. Be predictable." : ""}
Generate a clear, engaging, child-friendly textual explanation of the course content.
Use simple language appropriate for elementary students.
Format with: a brief intro, 3-5 key points, and a fun closing fact. Use emojis.`,

  quiz: (condition) => `You are EduKids AI Quiz Master.
${condition === "adhd" ? "Keep questions SHORT. Use emojis. Make it exciting! ⚡" : ""}
${condition === "autism" ? "Be very clear. No trick questions. Simple direct language." : ""}
Generate 5 multiple-choice questions about the course content.
Return ONLY valid JSON (no markdown) in this format:
{"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]}
Make it fun and age-appropriate!`,

  video: (_) => `You are EduKids AI Script Writer.
Write a short, engaging animated video script (about 150-200 words) for elementary students explaining the course content.
Format it as: [INTRO] ... [SCENE 1] ... [SCENE 2] ... [SCENE 3] ... [OUTRO]
Include descriptions of fun animations and visuals in brackets. Use simple, exciting language!`,

  audio: (_) => `You are EduKids AI Audio Narrator.
Write a warm, friendly narration script (about 120-150 words) for an audio lesson for elementary students.
Make it conversational, like a friendly teacher talking directly to the child.
Include [PAUSE] markers and [EMPHASIZE: word] for key terms.
Start with "Hello, superstar! Today we're going to learn about..."`,
};

export default function AIOutputModal({ action, course, onClose }) {
  const { student } = useStudent();
  const [status, setStatus] = useState("loading"); // loading | done | error
  const [output, setOutput] = useState(null);
  const [quizState, setQuizState] = useState({ current: 0, answers: [], showResult: false, score: 0 });
  const overlayRef = useRef(null);

  useEffect(() => {
    generateContent();
    // eslint-disable-next-line
  }, []);

  const generateContent = async () => {
    setStatus("loading");
    try {
      const systemPrompt = SYSTEM_PROMPTS[action.id](student.condition);
      const userMessage = `Course title: "${course.title}"\nThis is a ${course.pages}-page PDF lesson for elementary school students. Generate the requested content based on this course topic.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const text = data.content?.map((b) => b.text || "").join("") || "";

      if (action.id === "quiz") {
        const clean = text.replace(/```json|```/g, "").trim();
        try {
          const parsed = JSON.parse(clean);
          setOutput(parsed);
        } catch {
          // fallback if JSON parse fails
          setOutput({ raw: text });
        }
      } else {
        setOutput({ text });
      }

      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="ai-modal page-enter">
        {/* Header */}
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
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {status === "loading" && <LoadingState action={action} />}
          {status === "error" && <ErrorState onRetry={generateContent} />}
          {status === "done" && action.id !== "quiz" && <TextOutput output={output} action={action} />}
          {status === "done" && action.id === "quiz" && (
            <QuizOutput
              output={output}
              state={quizState}
              setState={setQuizState}
              course={course}
            />
          )}
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
      <h3 className="loading-title">Creating your {action.label.toLowerCase()}…</h3>
      <p className="loading-sub">Our AI is reading the lesson for you 🤖✨</p>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="error-state">
      <div className="error-emoji">😕</div>
      <h3>Oops! Something went wrong</h3>
      <p>Our AI couldn't generate the content right now.</p>
      <button className="btn btn-primary" onClick={onRetry}>Try Again 🔄</button>
    </div>
  );
}

function TextOutput({ output, action }) {
  const text = output?.text || "";

  const renderFormatted = (raw) => {
    return raw.split("\n").map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      if (line.startsWith("[") && line.includes("]")) {
        return (
          <div key={i} className="script-label">
            {line}
          </div>
        );
      }
      return <p key={i} className="output-para">{line}</p>;
    });
  };

  return (
    <div className="text-output">
      <div className="output-badge" style={{ background: action.gradient }}>
        {action.emoji} AI Generated
      </div>
      <div className="output-content">{renderFormatted(text)}</div>
    </div>
  );
}

function QuizOutput({ output, state, setState, course }) {
  if (!output?.questions) {
    return <TextOutput output={{ text: output?.raw || "Quiz generation failed." }} action={{ emoji: "🎯", gradient: "linear-gradient(135deg,#10B981,#059669)" }} />;
  }

  const questions = output.questions;
  const { current, answers, showResult, score } = state;

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-result">
        <div className="quiz-result-emoji">
          {pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚"}
        </div>
        <h3 className="quiz-result-title">
          {pct >= 80 ? "Amazing!" : pct >= 60 ? "Good job!" : "Keep practicing!"}
        </h3>
        <div className="quiz-score-circle">
          <span className="quiz-score-num">{score}/{questions.length}</span>
          <span className="quiz-score-pct">{pct}%</span>
        </div>
        <div className="quiz-review">
          {questions.map((q, i) => (
            <div key={i} className={`quiz-review-item ${answers[i] === q.correct ? "correct" : "wrong"}`}>
              <span className="review-icon">{answers[i] === q.correct ? "✅" : "❌"}</span>
              <div>
                <div className="review-q">{q.question}</div>
                <div className="review-exp">✨ {q.explanation}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setState({ current: 0, answers: [], showResult: false, score: 0 })}
        >
          Try Again 🔄
        </button>
      </div>
    );
  }

  const q = questions[current];

  const handleAnswer = (idx) => {
    const newAnswers = [...answers, idx];
    const isCorrect = idx === q.correct;
    const newScore = score + (isCorrect ? 1 : 0);

    if (current + 1 >= questions.length) {
      setState({ current: current + 1, answers: newAnswers, showResult: true, score: newScore });
    } else {
      setState({ current: current + 1, answers: newAnswers, showResult: false, score: newScore });
    }
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