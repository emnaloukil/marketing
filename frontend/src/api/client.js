// src/api/client.js

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const request = async (method, endpoint, data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const config = {
    method,
    headers,
  }

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  let json = {}
  try {
    json = await response.json()
  } catch {
    json = {}
  }

  if (!response.ok) {
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

export const sessionsAPI = {
  start: (data, token) => request('POST', '/sessions/start', data, token),
  end: (id, token) => request('POST', `/sessions/${id}/end`, null, token),
  getActive: (classId, token) => request('GET', `/sessions/active/${classId}`, null, token),
  getById: (id, token) => request('GET', `/sessions/${id}`, null, token),
}

export const teacherAPI = {
  getDashboard: (sessionId, token) => request('GET', `/teacher/dashboard/${sessionId}`, null, token),
}

export const eventsAPI = {
  buttonPress: (data, token) => request('POST', '/events/button-press', data, token),
  getBySession: (sessionId, token) => request('GET', `/events/session/${sessionId}`, null, token),
}

export const parentAPI = {
  getChildren: (parentId, token) => request('GET', `/parent/children/${parentId}`, null, token),
  addChild: (data, token) => request('POST', '/parent/children', data, token),
  getDailySummary: (studentId, date, token) =>
    request(
      'GET',
      `/parent/daily-summary/${studentId}${date ? `?date=${date}` : ''}`,
      null,
      token
    ),
}

export const studentAPI = {
  getProfile: (studentId, token) => request('GET', `/student-auth/profile/${studentId}`, null, token),
}

export default {
  auth: authAPI,
  sessions: sessionsAPI,
  teacher: teacherAPI,
  events: eventsAPI,
  parent: parentAPI,
  student: studentAPI,
}