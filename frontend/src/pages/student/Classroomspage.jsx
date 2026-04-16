import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { classesAPI, studentsAPI } from "../../api/client"
import { useStudent } from "../../context/Studentcontext"
import { mapBackendClassroomToCard } from "../../utils/studentClassroom"
import Header from "../../components/student/Header"
import ChatbotFAB from "../../components/student/Chatbotfab"
import "./Classrooms.css"

function getFreshStudentId(studentFromContext) {
  try {
    const raw = localStorage.getItem("ek_user")
    const parsed = raw ? JSON.parse(raw) : null
    return (
      parsed?._id ||
      parsed?.id ||
      studentFromContext?._id ||
      studentFromContext?.id ||
      null
    )
  } catch {
    return studentFromContext?._id || studentFromContext?.id || null
  }
}

export default function ClassroomsPage() {
  const navigate = useNavigate()
  const { student, classrooms = [], enterClassroom, theme, reloadClassrooms } = useStudent()

  const [showJoinModal, setShowJoinModal] = useState(false)
  const [classroomCode, setClassroomCode] = useState("")
  const [joinError, setJoinError] = useState("")
  const [joining, setJoining] = useState(false)
  const [joinedClassroom, setJoinedClassroom] = useState(null)
  const [loadingClassroom, setLoadingClassroom] = useState(true)

  const displayClassrooms = useMemo(() => {
    const base = Array.isArray(classrooms) ? [...classrooms] : []

    if (
      joinedClassroom &&
      !base.some((c) => String(c.id) === String(joinedClassroom.id))
    ) {
      base.unshift(joinedClassroom)
    }

    return base
  }, [classrooms, joinedClassroom])

  const completedCount = displayClassrooms.reduce(
    (acc, cls) => acc + (cls.courses || []).filter((c) => c.completed).length,
    0
  )

  const totalCourses = displayClassrooms.reduce(
    (acc, cls) => acc + (cls.courses || []).length,
    0
  )

  useEffect(() => {
    const loadCurrentClassroom = async () => {
      try {
        setLoadingClassroom(true)

        const studentId = getFreshStudentId(student)
        if (!studentId) {
          setJoinError("Student ID introuvable. Verifie le login etudiant.")
          setJoinedClassroom(null)
          return
        }

        const res = await studentsAPI.getClassroom(studentId)
        const data = res?.data

        if (!data || !data.joined || !Array.isArray(data.classrooms) || data.classrooms.length === 0) {
          setJoinedClassroom(null)
          return
        }

        setJoinedClassroom(mapBackendClassroomToCard(data.classrooms[0]))
      } catch (err) {
        console.warn("[ClassroomsPage] loadCurrentClassroom error =", err.message)
        setJoinedClassroom(null)
      } finally {
        setLoadingClassroom(false)
      }
    }

    loadCurrentClassroom()
  }, [student])

  const handleJoinClassroom = async () => {
    const code = classroomCode.trim().toUpperCase()
    if (!code) return

    try {
      setJoining(true)
      setJoinError("")

      const studentId = getFreshStudentId(student)

      if (!studentId) {
        throw new Error("Student ID introuvable. Reconnecte-toi avec un vrai compte eleve.")
      }

      await classesAPI.getByCode(code)

      const joinRes = await studentsAPI.joinClassroom(studentId, code)
      const classroomData = joinRes?.data?.classroomData

      if (classroomData?.classrooms?.length) {
        const matched = classroomData.classrooms.find(
          (cls) => cls.classCode === code
        )
        const mappedClassroom = mapBackendClassroomToCard(matched || classroomData.classrooms[0])
        setJoinedClassroom(mappedClassroom)
        navigate(`/student/classroom/${mappedClassroom.id}`)
      } else {
        const currentRes = await studentsAPI.getClassroom(studentId)
        const currentData = currentRes?.data

        if (currentData?.joined && Array.isArray(currentData.classrooms) && currentData.classrooms.length) {
          const matched = currentData.classrooms.find(
            (cls) => cls.classCode === code
          )
          const mappedClassroom = mapBackendClassroomToCard(
            matched || currentData.classrooms[0]
          )
          setJoinedClassroom(mappedClassroom)
          navigate(`/student/classroom/${mappedClassroom.id}`)
        }
      }

      reloadClassrooms()
      setClassroomCode("")
      setShowJoinModal(false)
    } catch (err) {
      console.warn("[ClassroomsPage] handleJoinClassroom error =", err.message)
      setJoinError(err.message || "Unable to join classroom")
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="classrooms-page page-enter">
      <Header />

      <div className="container">
        <div
          className="welcome-banner"
          style={{ background: theme.colors.headerGradient }}
        >
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="welcome-title">
                Hey {student.avatar} {student.name}!
              </h1>
              <p className="welcome-sub">
                Ready to learn something awesome today?
              </p>
              <div className="welcome-badge-row">
                <span className="welcome-badge">{student.grade}</span>
                <span className="welcome-note">
                  Pick a classroom and start your adventure.
                </span>
              </div>
            </div>

            <div className="welcome-stats">
              <div className="stat-pill">
                <span className="stat-icon">🏫</span>
                <div>
                  <div className="stat-val">{displayClassrooms.length}</div>
                  <div className="stat-label">Classes</div>
                </div>
              </div>

              <div className="stat-pill">
                <span className="stat-icon">📖</span>
                <div>
                  <div className="stat-val">
                    {completedCount}/{totalCourses}
                  </div>
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

          <div className="welcome-deco deco1">⭐</div>
          <div className="welcome-deco deco2">🎯</div>
          <div className="welcome-deco deco3">🚀</div>
        </div>

        <div className="section-header">
          <h2 className="section-title">My Classrooms</h2>
          <span className="badge">{displayClassrooms.length} active</span>
        </div>

        <div className="add-classroom-section">
          <button
            className="add-classroom-button"
            onClick={() => {
              setJoinError("")
              setShowJoinModal(true)
            }}
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

        {loadingClassroom ? (
          <p style={{ color: "#8b5cf6", fontWeight: 700 }}>Loading classrooms...</p>
        ) : (
          <div className="classrooms-grid">
            {displayClassrooms.map((classroom, i) => (
              <ClassroomCard
                key={classroom.id}
                classroom={classroom}
                onEnter={() => enterClassroom(classroom)}
                delay={i * 60}
              />
            ))}
          </div>
        )}
      </div>

      <ChatbotFAB />

      {showJoinModal && (
        <div
          className="join-modal-overlay"
          onClick={() => !joining && setShowJoinModal(false)}
        >
          <div className="join-modal" onClick={(e) => e.stopPropagation()}>
            <div className="join-modal-header">
              <h3>Join New Classroom</h3>
              <button
                className="close-btn"
                onClick={() => !joining && setShowJoinModal(false)}
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
                className="code-input"
                autoFocus
              />

              {joinError && (
                <p style={{ marginTop: 10, color: "#ef4444", fontWeight: 700 }}>
                  {joinError}
                </p>
              )}
            </div>

            <div className="join-modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowJoinModal(false)}
                disabled={joining}
              >
                Cancel
              </button>

              <button
                className="join-btn"
                onClick={handleJoinClassroom}
                disabled={!classroomCode.trim() || joining}
              >
                {joining ? "Joining..." : "Join Classroom"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClassroomCard({ classroom, onEnter, delay }) {
  const courses = classroom.courses || []
  const completedInClass = courses.filter((c) => c.completed).length
  const progress = courses.length ? (completedInClass / courses.length) * 100 : 0

  return (
    <div
      className="classroom-card card page-enter"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
    >
      <div className="classroom-topbar" style={{ background: classroom.color }} />

      <div className="classroom-body">
        <div className="classroom-header-row">
          <div
            className="classroom-emoji-wrap"
            style={{ background: classroom.color + "22" }}
          >
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
          <div className="classroom-info-pill">
            👥 {classroom.studentsCount || 0} students
          </div>
          <div className="classroom-info-pill">
            📄 {courses.length} lessons
          </div>
        </div>

        <div className="progress-wrap">
          <div className="progress-top">
            <span>Progress</span>
            <span>
              {completedInClass}/{courses.length}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%`, background: classroom.color }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary classroom-enter-btn"
          style={{
            background: `linear-gradient(135deg, ${classroom.color}, ${classroom.color}cc)`,
          }}
        >
          Enter Classroom
        </button>
      </div>
    </div>
  )
}
