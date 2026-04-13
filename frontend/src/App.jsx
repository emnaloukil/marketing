// src/App.jsx

import { Routes, Route, Navigate, Link } from 'react-router-dom'
import './styles/tokens.css'

import RoleSelectPage from './pages/RoleSelectPage'
import TeacherRegisterPage from './pages/teacher/TeacherRegisterPage'
import TeacherLoginPage from './pages/teacher/TeacherLoginPage'
import TeacherDashboard from './pages/teacher/TeacherDashboard'

const App = () => {
  return (
    <Routes>
      {/* ── Home / Role Select ───────────────────────────────────── */}
      <Route path="/" element={<RoleSelectPage />} />
      <Route path="/role-select" element={<RoleSelectPage />} />

      {/* ── Teacher ──────────────────────────────────────────────── */}
      <Route path="/teacher/register" element={<TeacherRegisterPage />} />
      <Route path="/teacher/login" element={<TeacherLoginPage />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

      <Route
        path="/teacher/session"
        element={<Placeholder title="Live Session" color="#4ECDC4" backTo="/teacher/dashboard" backLabel="← Dashboard teacher" />}
      />
      <Route
        path="/teacher/students"
        element={<Placeholder title="Mes élèves" color="#9B8EFF" backTo="/teacher/dashboard" backLabel="← Dashboard teacher" />}
      />
      <Route
        path="/teacher/stats"
        element={<Placeholder title="Statistiques" color="#9B8EFF" backTo="/teacher/dashboard" backLabel="← Dashboard teacher" />}
      />
      <Route
        path="/teacher/planning"
        element={<Placeholder title="Planning" color="#FFB347" backTo="/teacher/dashboard" backLabel="← Dashboard teacher" />}
      />
      <Route
        path="/teacher/messages"
        element={<Placeholder title="Messages" color="#FF6B6B" backTo="/teacher/dashboard" backLabel="← Dashboard teacher" />}
      />

      {/* ── Parent ───────────────────────────────────────────────── */}
      <Route
        path="/parent/login"
        element={<Placeholder title="Parent Login" color="#FF6B6B" />}
      />
      <Route
        path="/parent/register"
        element={<Placeholder title="Parent Register" color="#FF6B6B" />}
      />
      <Route
        path="/parent/dashboard"
        element={<Placeholder title="Parent Dashboard" color="#FF6B6B" />}
      />

      {/* ── Student ──────────────────────────────────────────────── */}
      <Route
        path="/student/login"
        element={<Placeholder title="Student Login" color="#4ECDC4" />}
      />
      <Route
        path="/student/dashboard"
        element={<Placeholder title="Student Dashboard" color="#4ECDC4" />}
      />

      {/* ── Fallback ─────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const Placeholder = ({
  title,
  color,
  backTo = '/',
  backLabel = "← Retour à l'accueil",
}) => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #FFF9F4 0%, #F8F7FF 100%)',
      gap: 20,
      fontFamily: "'Nunito', sans-serif",
      padding: 24,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 24,
        background: color,
        opacity: 0.2,
      }}
    />
    <h2
      style={{
        fontFamily: "'Baloo 2', cursive",
        fontSize: '1.8rem',
        color,
        fontWeight: 800,
        margin: 0,
      }}
    >
      {title}
    </h2>
    <p style={{ color: '#9E99B8', fontWeight: 600, margin: 0 }}>
      Page en cours de construction — prochaine étape !
    </p>

    <Link
      to={backTo}
      style={{
        marginTop: 12,
        padding: '11px 28px',
        borderRadius: 9999,
        background: color,
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.90rem',
        textDecoration: 'none',
      }}
    >
      {backLabel}
    </Link>
  </div>
)

export default App