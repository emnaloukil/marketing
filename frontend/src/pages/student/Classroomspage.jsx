import React from "react";
import { useStudent } from "../../context/Studentcontext";
import Header from "../../components/student/Header";
import ChatbotFAB from "../../components/student/Chatbotfab";
import "./Classrooms.css";

export default function ClassroomsPage() {
  const { student, classrooms, enterClassroom, theme } = useStudent();

  const completedCount = classrooms.reduce(
    (acc, cls) => acc + cls.courses.filter((c) => c.completed).length,
    0
  );
  const totalCourses = classrooms.reduce((acc, cls) => acc + cls.courses.length, 0);

  return (
    <div className="classrooms-page page-enter">
      <Header />
      <div className="container">
        {/* Welcome banner */}
        <div className="welcome-banner" style={{ background: theme.colors.headerGradient }}>
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="welcome-title">
                Hey {student.avatar} {student.name}!
              </h1>
              <p className="welcome-sub">Ready to learn something awesome today?</p>
              <div className="welcome-badge-row">
                <span className="welcome-badge">{student.grade}</span>
                <span className="welcome-note">Pick a classroom and start your adventure.</span>
              </div>
            </div>
            <div className="welcome-stats">
              <div className="stat-pill">
                <span className="stat-icon">🏫</span>
                <div>
                  <div className="stat-val">{classrooms.length}</div>
                  <div className="stat-label">Classes</div>
                </div>
              </div>
              <div className="stat-pill">
                <span className="stat-icon">📖</span>
                <div>
                  <div className="stat-val">{completedCount}/{totalCourses}</div>
                  <div className="stat-label">Lessons Done</div>
                </div>
              </div>
              <div className="stat-pill">
                <span className="stat-icon">🔥</span>
                <div>
                  <div className="stat-val">{student.streak}</div>
                  <div className="stat-label">Day Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating decorations */}
          <div className="welcome-deco deco1">⭐</div>
          <div className="welcome-deco deco2">🎯</div>
          <div className="welcome-deco deco3">🚀</div>
        </div>

        {/* Section header */}
        <div className="section-header">
          <h2 className="section-title">My Classrooms</h2>
          <span className="badge">{classrooms.length} active</span>
        </div>

        {/* Classrooms grid */}
        <div className="classrooms-grid">
          {classrooms.map((classroom, i) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              onEnter={() => enterClassroom(classroom)}
              delay={i * 60}
            />
          ))}
        </div>
      </div>
      <ChatbotFAB />
    </div>
  );
}

function ClassroomCard({ classroom, onEnter, delay }) {
  const completedInClass = classroom.courses.filter((c) => c.completed).length;
  const progress = (completedInClass / classroom.courses.length) * 100;

  return (
    <div
      className="classroom-card card page-enter"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
    >
      {/* Color top bar */}
      <div className="classroom-topbar" style={{ background: classroom.color }} />

      <div className="classroom-body">
        <div className="classroom-header-row">
          <div className="classroom-emoji-wrap" style={{ background: classroom.color + "22" }}>
            <span className="classroom-emoji">{classroom.emoji}</span>
          </div>
          <div className="classroom-meta">
            <div className="last-activity">🕐 {classroom.lastActivity}</div>
          </div>
        </div>

        <h3 className="classroom-name">{classroom.name}</h3>

        <div className="classroom-teacher">
          <span className="teacher-avatar">{classroom.teacherAvatar}</span>
          <span className="teacher-name">{classroom.teacher}</span>
        </div>

        <div className="classroom-info-row">
          <span className="info-chip">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {classroom.studentsCount} students
          </span>
          <span className="info-chip">
            📄 {classroom.courses.length} lessons
          </span>
        </div>

        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-label">
            <span>Progress</span>
            <span>{completedInClass}/{classroom.courses.length}</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%`, background: classroom.color }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary classroom-enter-btn"
          style={{ background: `linear-gradient(135deg, ${classroom.color}, ${classroom.color}cc)` }}
          onClick={(e) => { e.stopPropagation(); onEnter(); }}
        >
          Enter Classroom
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}