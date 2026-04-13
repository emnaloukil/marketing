import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ParentDashboard from './components/parent/ParentDashboard'
import TeacherDashboard from './components/teacher/TeacherDashboard'

import BuddyPage from './components/student/BuddyPage'

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#F5F4EF', minHeight: '100vh' }}>
        <Routes>
          <Route path="/"         element={<ParentDashboard />} />
          <Route path="/teacher"  element={<TeacherDashboard />} />
          <Route path="/buddy"    element={<BuddyPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App