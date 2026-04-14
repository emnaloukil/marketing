import React, { useState } from "react";
import { useStudent } from "../../context/Studentcontext";
import Header from "../../components/student/Header";
import ChatbotFAB from "../../components/student/Chatbotfab";
import "./Classrooms.css";

export default function ClassroomsPage() {
  const { student, classrooms, enterClassroom, theme } = useStudent();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classroomCode, setClassroomCode] = useState("");

  const completedCount = classrooms.reduce(
    (acc, cls) => acc + cls.courses.filter((c) => c.completed).length,
    0
  );
  const totalCourses = classrooms.reduce((acc, cls) => acc + cls.courses.length, 0);

  const handleJoinClassroom = () => {
    if (!classroomCode.trim()) return;

    // For now, create a mock classroom with the entered code
    // In a real implementation, this would call an API to join the classroom
    // const newClassroom = {
    //   id: `cls_${Date.now()}`,
    //   name: `Classroom ${classroomCode}`,
    //   teacher: "New Teacher",
    //   teacherAvatar: "👩‍🏫",
    //   color: "#7C3AED",
    //   emoji: "🏫",
    //   studentsCount: 25,
    //   coursesCount: 5,
    //   lastActivity: "Just joined",
    //   courses: [
    //     { id: `crs_${Date.now()}_1`, title: "Welcome Lesson", pages: 8, uploadedAt: new Date().toLocaleDateString(), thumbnail: "📚", size: "1.2 MB", completed: false },
    //   ],
    // };

    // Add to classrooms (in a real app, this would update the context/state)
    // For now, we'll just close the modal
    setClassroomCode("");
    setShowJoinModal(false);
  };

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

        {/* Add Classroom Button */}
        <div className="add-classroom-section">
          <button
            className="add-classroom-button"
            onClick={() => setShowJoinModal(true)}
            aria-label="Join new classroom"
            title="Join new classroom"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Join New Classroom
          </button>
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

      {/* Join Classroom Modal */}
      {showJoinModal && (
        <div className="join-modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="join-modal" onClick={(e) => e.stopPropagation()}>
            <div className="join-modal-header">
              <h3>Join New Classroom</h3>
              <button
                className="close-btn"
                onClick={() => setShowJoinModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="join-modal-body">
              <p>Enter the classroom code provided by your teacher:</p>
              <input
                type="text"
                value={classroomCode}
                onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
                placeholder="e.g., CLS-1234"
                className="code-input"
                autoFocus
              />
            </div>
            <div className="join-modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
              <button
                className="join-btn"
                onClick={handleJoinClassroom}
                disabled={!classroomCode.trim()}
              >
                Join Classroom
              </button>
            </div>
          </div>
        </div>
      )}
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