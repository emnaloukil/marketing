import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useStudent } from "../../context/Studentcontext";
import Header from "../../components/student/Header";
import ChatbotFAB from "../../components/student/Chatbotfab";
import AIOutputModal from "../../components/student/Aioutputmodal";
import "./Courspage.css";

const ACTION_BUTTONS = [
  {
    id: "video",
    label: "Generate Video",
    emoji: "🎬",
    desc: "Watch an animated explainer",
    color: "#EF4444",
    gradient: "linear-gradient(135deg, #EF4444, #F97316)",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    id: "audio",
    label: "Generate Audio",
    emoji: "🎧",
    desc: "Listen to the lesson read aloud",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #A855F7)",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "explanation",
    label: "Text Explanation",
    emoji: "📝",
    desc: "Read a simplified summary",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9, #06B6D4)",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "quiz",
    label: "Take a Quiz",
    emoji: "🎯",
    desc: "Test your knowledge",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function CoursePage() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get("classroomId");

  const {
    activeCourse,
    activeClassroom,
    classrooms,
    student,
    loadingClassrooms,
    markCourseComplete,
    markCourseIncomplete,
  } = useStudent();

  const [modalAction, setModalAction] = useState(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState("");

  const resolvedClassroom = useMemo(
    () =>
      activeClassroom ||
      classrooms.find((c) => c.id === classroomId) ||
      classrooms.find((c) => c.courses.some((course) => course.id === courseId)),
    [activeClassroom, classroomId, classrooms, courseId]
  );

  const resolvedCourse = useMemo(
    () =>
      activeCourse?.id === courseId
        ? activeCourse
        : resolvedClassroom?.courses.find((course) => course.id === courseId),
    [activeCourse, resolvedClassroom, courseId]
  );

  useEffect(() => {
    setPdfPage(1);
  }, [courseId]);

  if (!resolvedCourse && loadingClassrooms) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#9E99B8" }}>
        Loading lesson...
      </div>
    );
  }

  if (!resolvedCourse) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#9E99B8" }}>
        Cours introuvable.
      </div>
    );
  }

  const pageCount = resolvedCourse.pages || 1;
  const viewerUrl = resolvedCourse.fileUrl
    ? `${resolvedCourse.fileUrl}#toolbar=0&navpanes=0&page=${pdfPage}`
    : "";

  const handleToggleComplete = async () => {
    setCompleteLoading(true);
    setCompleteError("");

    try {
      if (resolvedCourse.completed) {
        await markCourseIncomplete(resolvedCourse.id);
      } else {
        await markCourseComplete(resolvedCourse.id);
      }
    } catch (err) {
      setCompleteError(err.message || "Unable to update lesson status");
    } finally {
      setCompleteLoading(false);
    }
  };

  return (
    <div className="course-page page-enter">
      <Header />
      <div className="container">
        <div className="course-layout">
          <div className="pdf-panel card">
            <div
              className="pdf-panel-header"
              style={{ background: (resolvedClassroom?.color ?? "#7C3AED") + "18" }}
            >
              <div className="pdf-header-left">
                <span className="pdf-icon-big">{resolvedCourse.thumbnail}</span>
                <div>
                  <h2 className="pdf-title">{resolvedCourse.title}</h2>
                  <p className="pdf-sub">
                    {resolvedClassroom?.name} · {resolvedCourse.pages ? `${resolvedCourse.pages} pages` : "PDF lesson"}
                  </p>
                </div>
              </div>
              <div className="pdf-tag">
                <svg width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                PDF
              </div>
            </div>

            <div className="pdf-viewer">
              <div className="pdf-page-shell">
                <div className="pdf-page-number-badge">
                  Page {Math.min(pdfPage, pageCount)} of {pageCount}
                </div>

                {viewerUrl ? (
                  <iframe
                    key={viewerUrl}
                    title={resolvedCourse.title}
                    src={viewerUrl}
                    className="pdf-iframe"
                  />
                ) : (
                  <div className="pdf-empty-state">
                    <div className="pdf-empty-icon">📄</div>
                    <p>No PDF file is attached to this lesson yet.</p>
                  </div>
                )}
              </div>

              <div className="pdf-nav">
                <button
                  className="pdf-nav-btn"
                  disabled={pdfPage <= 1}
                  onClick={() => setPdfPage((page) => Math.max(1, page - 1))}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Prev
                </button>

                <div className="pdf-page-dots">
                  {Array.from({ length: Math.min(pageCount, 8) }, (_, index) => (
                    <div
                      key={index}
                      className={`pdf-dot ${pdfPage === index + 1 ? "active" : ""}`}
                      onClick={() => setPdfPage(index + 1)}
                      style={
                        pdfPage === index + 1
                          ? { background: resolvedClassroom?.color ?? "#7C3AED" }
                          : {}
                      }
                    />
                  ))}
                  {pageCount > 8 && <span className="pdf-more">…</span>}
                </div>

                <button
                  className="pdf-nav-btn"
                  disabled={pdfPage >= pageCount}
                  onClick={() => setPdfPage((page) => Math.min(pageCount, page + 1))}
                >
                  Next
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div className="pdf-footer-actions">
                <button
                  className={`lesson-complete-btn ${resolvedCourse.completed ? "completed" : ""}`}
                  onClick={handleToggleComplete}
                  disabled={completeLoading}
                >
                  {completeLoading
                    ? "Saving..."
                    : resolvedCourse.completed
                      ? "✓ Done"
                      : "Mark as Done"}
                </button>

                {resolvedCourse.fileUrl && (
                  <a
                    className="pdf-open-link"
                    href={resolvedCourse.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open PDF ↗
                  </a>
                )}
              </div>

              {completeError && <p className="course-error-text">{completeError}</p>}
            </div>
          </div>

          <div className="actions-panel">
            <div className="actions-header">
              <h3 className="actions-title">🤖 AI Learning Tools</h3>
              <p className="actions-sub">
                Choose how {student.name} wants to learn this lesson
              </p>
            </div>

            <div className="action-buttons-grid">
              {ACTION_BUTTONS.map((action, i) => (
                <ActionButton
                  key={action.id}
                  action={action}
                  delay={i * 80}
                  onClick={() => setModalAction(action)}
                />
              ))}
            </div>

            <div className="lesson-info-card card">
              <div className="lesson-info-row">
                <span className="info-ico">📄</span>
                <div>
                  <div className="info-key">Document</div>
                  <div className="info-val">{resolvedCourse.title}</div>
                </div>
              </div>
              <div className="lesson-info-row">
                <span className="info-ico">🏫</span>
                <div>
                  <div className="info-key">Class</div>
                  <div className="info-val">{resolvedClassroom?.name}</div>
                </div>
              </div>
              <div className="lesson-info-row">
                <span className="info-ico">📏</span>
                <div>
                  <div className="info-key">Length</div>
                  <div className="info-val">
                    {resolvedCourse.pages ? `${resolvedCourse.pages} pages` : "PDF lesson"}
                    {resolvedCourse.size ? ` · ${resolvedCourse.size}` : ""}
                  </div>
                </div>
              </div>
              <div className="lesson-info-row">
                <span className="info-ico">📅</span>
                <div>
                  <div className="info-key">Uploaded</div>
                  <div className="info-val">{resolvedCourse.uploadedAt}</div>
                </div>
              </div>
              <div className="lesson-info-row">
                <span className="info-ico">✅</span>
                <div>
                  <div className="info-key">Status</div>
                  <div className="info-val">{resolvedCourse.completed ? "Completed" : "In progress"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalAction && (
        <AIOutputModal
          action={modalAction}
          course={resolvedCourse}
          onClose={() => setModalAction(null)}
        />
      )}
      <ChatbotFAB />
    </div>
  );
}

function ActionButton({ action, delay, onClick }) {
  return (
    <button
      className="action-btn page-enter"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="action-btn-icon" style={{ background: action.gradient }}>
        {action.icon}
      </div>
      <div className="action-btn-text">
        <div className="action-btn-label">{action.label}</div>
        <div className="action-btn-desc">{action.desc}</div>
      </div>
      <div className="action-btn-arrow" style={{ color: action.color }}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
}
