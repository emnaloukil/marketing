import React from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "../../context/Studentcontext";
import "./ChatbotFAB.css";

export default function ChatbotFAB() {
  const navigate = useNavigate();
  const { chatbotOpen, setChatbotOpen, theme } = useStudent();

  const handleFabClick = () => {
    setChatbotOpen(true);
    navigate("/student/buddy");
  };

  return (
    <button
      className={`chatbot-fab ${chatbotOpen ? "fab-open" : ""}`}
      onClick={handleFabClick}
      aria-label="Speak with Buddy"
      title="Speak with Buddy"
      style={{ background: theme.colors.buttonGradient }}
    >
      <div className="fab-avatar">
        {chatbotOpen ? (
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span className="fab-emoji">🤖</span>
        )}
      </div>

      {!chatbotOpen && (
        <>
          <div className="fab-pulse-ring" style={{ borderColor: theme.colors.primary }} />
          <div className="fab-label">Ask AI Tutor</div>
        </>
      )}
    </button>
  );
}