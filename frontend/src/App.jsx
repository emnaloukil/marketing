import { Routes, Route, Navigate, Link } from 'react-router-dom'
import './styles/tokens.css'

// ── Pages existantes ────────────────────────────────────────────
import RoleSelectPage      from './pages/RoleSelectPage'
import TeacherRegisterPage from './pages/teacher/TeacherRegisterPage'
import TeacherLoginPage from './pages/teacher/TeacherLoginPage'
import ParentLoginPage from './pages/parent/ParentLoginPage'
import ParentRegisterPage from './pages/parent/ParentRegisterPage'
import StudentLoginPage from './pages/student/StudentLoginPage'
import TeacherClassesPage from './pages/teacher/TeacherClassesPage'
import TeacherClassLivePage from './pages/teacher/TeacherClassLivePage'
import BuddyPage from './pages/student/BuddyPage' // adapte le chemin si besoin
import ClassroomsPage from './pages/student/Classroomspage'
import TestPage from './pages/TestPage'
import Classroompage from './pages/student/Classroompage'
import Coursepage from './pages/student/Coursepage'
import BuddyPageWrapper from './pages/student/BuddyPageWrapper'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectPage />} />
      <Route path="/role-select" element={<RoleSelectPage />} />

      <Route path="/teacher/register" element={<TeacherRegisterPage />} />
      <Route path="/teacher/login" element={<TeacherLoginPage />} />
      <Route path="/teacher/classes" element={<TeacherClassesPage />} />
      <Route path="/teacher/class/:classId/live" element={<TeacherClassLivePage />} />
   
      <Route path="/teacher/class/:classId/live" element={<TeacherClassLivePage />} />

      <Route
        path="/teacher/students"
        element={
          <Placeholder
            title="Mes élèves"
            color="#9B8EFF"
            backTo="/teacher/classes"
            backLabel="← Classes"
          />
        }
      />
      <Route
        path="/teacher/stats"
        element={
          <Placeholder
            title="Statistiques"
            color="#9B8EFF"
            backTo="/teacher/classes"
            backLabel="← Classes"
          />
        }
      />
      <Route
        path="/teacher/planning"
        element={
          <Placeholder
            title="Planning"
            color="#FFB347"
            backTo="/teacher/classes"
            backLabel="← Classes"
          />
        }
      />
      <Route
        path="/teacher/messages"
        element={
          <Placeholder
            title="Messages"
            color="#FF6B6B"
            backTo="/teacher/classes"
            backLabel="← Classes"
          />
        }
      />

      <Route path="/parent/login" element={<ParentLoginPage />} />
      <Route path="/parent/register" element={<ParentRegisterPage />} />
      <Route
        path="/parent/dashboard"
        element={<Placeholder title="Parent Dashboard" color="#FF6B6B" />}
      />

      <Route path="/student/login" element={<StudentLoginPage />} />
      <Route
        path="/student/dashboard"
        element={<ClassroomsPage />}
      />
      <Route path="/student/classroom/:classroomId" element={<Classroompage />} />
      <Route path="/student/course/:courseId" element={<Coursepage />} />

      <Route path="/student/buddy" element={<BuddyPageWrapper />} />
      <Route path="/student/classrooms" element={<ClassroomsPage />} />

      <Route path="/test" element={<TestPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

// ── Placeholder ─────────────────────────────────────────────────
const Placeholder = ({ title, color, backTo = '/', backLabel = "← Retour à l'accueil" }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #FFF9F4 0%, #F8F7FF 100%)', gap: 20, fontFamily: "'Nunito', sans-serif", padding: 24, textAlign: 'center' }}>
    <div style={{ width: 80, height: 80, borderRadius: 24, background: color, opacity: 0.2 }} />
    <h2 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '1.8rem', color, fontWeight: 800, margin: 0 }}>{title}</h2>
    <p style={{ color: '#9E99B8', fontWeight: 600, margin: 0 }}>Page en cours de construction — prochaine étape !</p>
    <Link to={backTo} style={{ marginTop: 12, padding: '11px 28px', borderRadius: 9999, background: color, color: '#fff', fontWeight: 700, fontSize: '0.90rem', textDecoration: 'none' }}>{backLabel}</Link>
  </div>
)

export default App