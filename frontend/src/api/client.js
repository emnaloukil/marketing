export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const request = async (method, endpoint, data = null) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
  const headers = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const config = { method, headers }

  if (data && method !== 'GET') {
    config.body = isFormData ? data : JSON.stringify(data)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  let json = {}
  try {
    json = await response.json()
  } catch {
    json = {}
  }

  if (!response.ok || json.success === false) {
    throw new Error(json.message || json.error || 'Something went wrong')
  }

  return json
}

export const authAPI = {
  teacherRegister: (data) => request('POST', '/auth/teacher/register', data),
  teacherLogin: (data) => request('POST', '/auth/teacher/login', data),
  parentRegister: (data) => request('POST', '/auth/parent/register', data),
  parentLogin: (data) => request('POST', '/auth/parent/login', data),
  studentLogin: (data) => request('POST', '/student-auth/login', data),
}

export const classesAPI = {
  create: (data) => request('POST', '/classes', data),
  getByTeacher: (teacherId) => request('GET', `/classes/teacher/${teacherId}`),
  getByCode: (classCode) =>
    request('GET', `/classes/code/${encodeURIComponent(String(classCode).toUpperCase())}`),
  getById: (id) => request('GET', `/classes/${id}`),
  update: (id, data) => request('PATCH', `/classes/${id}`, data),
  delete: (id) => request('DELETE', `/classes/${id}`),
}

export const liveSessionAPI = {
  getClassDetails: (classId) =>
    request('GET', `/teacher/live/classes/${classId}`),

  getOrCreateSession: ({ classId, subject }) =>
    request('POST', `/teacher/live/session/start`, { classId, subject }),

  getSnapshot: (sessionId) =>
    request('GET', `/teacher/live/session/${sessionId}/snapshot`),

  getMaterials: ({ classId, subject }) =>
    request('GET', `/teacher/live/materials?classId=${classId}&subject=${subject}`),

  uploadMaterial: (formData) =>
    request('POST', `/teacher/live/materials/upload`, formData),
}

export const sessionsAPI = {
  start: (data) => request('POST', '/sessions/start', data),
  end: (id) => request('POST', `/sessions/${id}/end`),
  getActive: (classId) => request('GET', `/sessions/active/${classId}`),
  getById: (id) => request('GET', `/sessions/${id}`),
}

export const teacherAPI = {
  getDashboard: (sessionId) => request('GET', `/teacher/dashboard/${sessionId}`),
}

export const eventsAPI = {
  buttonPress: (data) => request('POST', '/events/button-press', data),
  getBySession: (sessionId) => request('GET', `/events/session/${sessionId}`),
}

export const parentAPI = {
  getChildren: (parentId) => request('GET', `/parent/children/${parentId}`),
  addChild: (data) => request('POST', '/parent/children', data),
  getDailySummary: (studentId, parentId, date = '') => {
    const params = new URLSearchParams()
    if (parentId) params.set('parentId', parentId)
    if (date) params.set('date', date)

    const query = params.toString() ? `?${params.toString()}` : ''
    return request('GET', `/parent/daily-summary/${studentId}${query}`)
  },
}

export const studentAPI = {
  getProfile: (studentId) => request('GET', `/student-auth/profile/${studentId}`),
}

export const studentsAPI = {
  getClassroom: (studentId) => request('GET', `/students/${studentId}/classroom`),
  joinClassroom: (studentId, classCode) =>
    request('POST', `/students/${studentId}/join-class`, { classCode }),
  completeMaterial: (studentId, materialId) =>
    request('POST', `/students/${studentId}/materials/${materialId}/complete`),
  uncompleteMaterial: (studentId, materialId) =>
    request('DELETE', `/students/${studentId}/materials/${materialId}/complete`),
}

export const materialsAPI = {
  getByClassroom: (classroomId) => request('GET', `/materials/classroom/${classroomId}`),
}

export const quizAPI = {
  create: (data) => request('POST', '/quiz/create', data),
  submit: (quizId, data) => request('POST', `/quiz/${quizId}/submit`, data),
  getMine: () => request('GET', '/quiz/my'),
  getSubmissions: () => request('GET', '/quiz/submissions'),
}

export default {
  auth: authAPI,
  classes: classesAPI,
  liveSession: liveSessionAPI,
  sessions: sessionsAPI,
  teacher: teacherAPI,
  events: eventsAPI,
  parent: parentAPI,
  student: studentAPI,
  students: studentsAPI,
  materials: materialsAPI,
  quiz: quizAPI,
}
