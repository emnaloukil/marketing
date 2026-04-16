import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudent } from "../../context/Studentcontext";
import { studentsAPI } from "../../api/client";
import { mapBackendClassroomToCard } from "../../utils/studentClassroom";
import Header from "../../components/student/Header";
import ChatbotFAB from "../../components/student/Chatbotfab";
import "./Classroompage.css";

export default function ClassroomPage() {
  const { classroomId } = useParams();
  const { classrooms, student, openCourse } = useStudent();
  const [loadingClassroom, setLoadingClassroom] = useState(false);
  const [fetchedClassroom, setFetchedClassroom] = useState(null);
  const navigate = useNavigate();

  const id = classroomId;
  const classroom = classrooms.find((c) => c.id === id) || fetchedClassroom;

  useEffect(() => {
    if (classroom || !student) return;

    const loadClassroom = async () => {
      setLoadingClassroom(true);
      try {
        const studentId = student?._id || student?.id;
        if (!studentId) return;

        const res = await studentsAPI.getClassroom(studentId);
        const data = res?.data;

        if (data?.joined && Array.isArray(data.classrooms)) {
          const matchedClassroom = data.classrooms.find(
            (item) => String(item._id) === String(id)
          );

          if (matchedClassroom) {
            setFetchedClassroom(mapBackendClassroomToCard(matchedClassroom));
          }
        }
      } catch (err) {
        console.warn("ClassroomPage loadClassroom error:", err.message);
      } finally {
        setLoadingClassroom(false);
      }
    };

    loadClassroom();
  }, [classroom, id, student]);

  if (loadingClassroom) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#9E99B8" }}>
        Chargement de la classe...
      </div>
    );
  }

  if (!classroom) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#9E99B8" }}>
        Classroom introuvable.{" "}
        <button onClick={() => navigate("/student/classrooms")}>← Retour</button>
      </div>
    );
  }

  const totalCourses = classroom.courses.length;
  const completed = classroom.courses.filter((c) => c.completed).length;
  const progress = totalCourses ? (completed / totalCourses) * 100 : 0;

  return (
    <div className="classroom-page page-enter">
      <Header />
      <div className="container">
        <div
          className="classroom-hero"
          style={{
            background: `linear-gradient(135deg, ${classroom.color} 0%, ${classroom.color}bb 100%)`,
          }}
        >
          <div className="hero-content">
            <div className="hero-emoji">{classroom.emoji}</div>
            <div className="hero-text">
              <h1 className="hero-title">{classroom.name}</h1>
              <p className="hero-subtitle">Let’s explore today’s lesson with fun activities and bright rewards!</p>
              <div className="hero-teacher">
                <span className="hero-chip">{classroom.teacherAvatar} {classroom.teacher}</span>
                <span className="hero-dot">·</span>
                <span className="hero-chip">{classroom.studentsCount} students</span>
              </div>
            </div>
          </div>

          <div className="hero-progress">
            <div className="hero-progress-label">
              <span>📚 Lessons completed</span>
              <span>{completed} of {totalCourses}</span>
            </div>
            <div className="hero-progress-bar">
              <div
                className="hero-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="hero-deco hd1">📐</div>
          <div className="hero-deco hd2">✨</div>
        </div>

        <div className="section-header" style={{ marginBottom: 24, marginTop: 36 }}>
          <h2 className="section-title">📄 Course Materials</h2>
          <span className="badge">{classroom.courses.length} PDFs</span>
        </div>

        <div className="courses-grid">
          {classroom.courses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              color={classroom.color}
              onOpen={() => openCourse(course, classroom)}
              delay={i * 60}
            />
          ))}
        </div>
      </div>
      <ChatbotFAB />
    </div>
  );
}

function CourseCard({ course, color, onOpen, delay }) {
  const lengthLabel = course.pages ? `${course.pages} pages` : "PDF lesson";
  const sizeLabel = course.size || "Open to view";

  return (
    <div
      className={`course-card card page-enter ${course.completed ? "course-completed" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="course-thumb" style={{ background: color + "18" }}>
        <div className="course-thumb-emoji">{course.thumbnail}</div>
        <div className="pdf-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          PDF
        </div>
        {course.completed && (
          <div className="completed-badge">✓ Done</div>
        )}
      </div>

      <div className="course-body">
        <h3 className="course-title">{course.title}</h3>

        <div className="course-meta">
          <span className="meta-item">📄 {lengthLabel}</span>
          <span className="meta-item">💾 {sizeLabel}</span>
        </div>

        <div className="course-date">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {course.uploadedAt}
        </div>

        <button
          className="btn btn-primary course-btn"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          onClick={onOpen}
        >
          {course.completed ? "Review Lesson" : "Start Learning"}
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
