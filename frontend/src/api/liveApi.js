const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const req = async (method, endpoint, data = null) => {

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Erreur réseau')
  return json
}

export const liveAPI = {
  startOrGet: (body) => req('POST', '/sessions/start', body),
  getSessionById: (sessionId) => req('GET', `/sessions/${sessionId}`),
  getActiveByClass: (classId) => req('GET', `/sessions/active/${classId}`),
  endSession: (sessionId) => req('POST', `/sessions/${sessionId}/end`),
  getSnapshot: (sessionId) => req('GET', `/teacher/live/session/${sessionId}/snapshot`),
}

export const materialsAPI = {
  get: (classId, subject, teacherId = '') => {
    const p = new URLSearchParams({
      classId,
      ...(subject ? { subject } : {}),
      ...(teacherId ? { teacherId } : {}),
    })
    return req('GET', `/materials?${p.toString()}`)
  },

  add: (body) => req('POST', '/materials', body),

  remove: (id) => req('DELETE', `/materials/${id}`),
}