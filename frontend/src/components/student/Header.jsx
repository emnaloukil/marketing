import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useStudent } from "../../context/Studentcontext";
import { CONDITIONS } from "../../utils/themes.js";
import "./Header.css";

export default function Header() {
  const location = useLocation();
  const { student, activeClassroom, activeCourse, goBack, updateCondition, theme } =
    useStudent();
  const [conditionMenuOpen, setConditionMenuOpen] = useState(false);

  const isClassrooms = location.pathname === "/student/classrooms" || location.pathname === "/student";
  const isClassroom  = location.pathname.startsWith("/student/classroom/");
  const isCourse     = location.pathname.startsWith("/student/course/");

  const canGoBack = !isClassrooms;

  const currentCondition = CONDITIONS.find((c) => c.id === student.condition);

  return (
    <header className="header" style={{ background: theme.colors.headerGradient }}>
      <div className="header-inner">
        {/* Left: back or logo */}
        <div className="header-left">
          {canGoBack ? (
            <button className="back-btn" onClick={goBack} aria-label="Go back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Back</span>
            </button>
          ) : (
            <div className="logo">
              <div className="logo-icon">🎓</div>
              <div className="logo-text">
                <span className="logo-name">EduKids</span>
                <span className="logo-sub">LEARN · GROW · SHINE</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: breadcrumb */}
        <div className="header-center">
          {isClassrooms && (
            <span className="breadcrumb">My Classrooms</span>
          )}
          {isClassroom && activeClassroom && (
            <span className="breadcrumb">
              {activeClassroom.emoji} {activeClassroom.name}
            </span>
          )}
          {isCourse && activeCourse && (
            <span className="breadcrumb">
              {activeCourse.thumbnail} {activeCourse.title}
            </span>
          )}
        </div>

        {/* Right: condition picker + student */}
        <div className="header-right">
          {/* Condition toggle */}
          <div className="condition-picker">
            <button
              className="condition-btn"
              onClick={() => setConditionMenuOpen((o) => !o)}
              title="Switch learning mode"
            >
              <span>{currentCondition?.emoji}</span>
              <span className="condition-label">{currentCondition?.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {conditionMenuOpen && (
              <div className="condition-menu">
                <p className="condition-menu-title">Learning Mode</p>
                {CONDITIONS.map((c) => (
                  <button
                    key={c.id}
                    className={`condition-option ${student.condition === c.id ? "active" : ""}`}
                    onClick={() => {
                      updateCondition(c.id);
                      setConditionMenuOpen(false);
                    }}
                  >
                    <span className="condition-option-emoji">{c.emoji}</span>
                    <div>
                      <div className="condition-option-name">{c.label}</div>
                      <div className="condition-option-desc">{c.desc}</div>
                    </div>
                    {student.condition === c.id && (
                      <span className="condition-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Student info */}
          <div className="student-chip">
            <div className="student-avatar">{student.avatar}</div>
            <div className="student-info">
              <span className="student-name">{student.name}</span>
              <span className="student-grade">{student.grade}</span>
            </div>
            <div className="student-xp">
              <span className="xp-bolt">⚡</span>
              <span>{student.xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for closing condition menu */}
      {conditionMenuOpen && (
        <div className="overlay-invisible" onClick={() => setConditionMenuOpen(false)} />
      )}
    </header>
  );
}