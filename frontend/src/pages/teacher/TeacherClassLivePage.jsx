import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { liveSessionAPI } from '../../api/client'

const SUBJECT_OPTIONS = [
  { value: 'reading', label: 'Reading' },
  { value: 'sciences', label: 'Sciences' },
  { value: 'mathematics', label: 'Mathematics' },
]

const TeacherClassLivePage = () => {
  const { classId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const fileInputRef = useRef(null)

  const [classInfo, setClassInfo] = useState(location.state?.cls || null)
  const [subject, setSubject] = useState('reading')
  const [session, setSession] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [materials, setMaterials] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')

  const studentRows = useMemo(() => {
    const studentScores = snapshot?.studentScores || {}
    const countsByStudent = snapshot?.countsByStudent || {}

    return Object.keys(studentScores).map((studentId) => ({
      studentId,
      score: studentScores[studentId] ?? 0,
      counts: countsByStudent[studentId] || {},
    }))
  }, [snapshot])

  useEffect(() => {
    const loadClass = async () => {
      try {
        if (classInfo?._id || classInfo?.id) return
        const res = await liveSessionAPI.getClassDetails(classId)
        setClassInfo(res?.class || res)
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load class.')
      }
    }

    loadClass()
  }, [classId, classInfo])

  useEffect(() => {
    const bootstrap = async () => {
      setPageLoading(true)
      setSessionLoading(true)
      setError('')

      try {
        const sessionRes = await liveSessionAPI.getOrCreateSession({ classId, subject })
        const activeSession = sessionRes?.session || sessionRes
        setSession(activeSession)

        const [snapshotRes, materialsRes] = await Promise.all([
          liveSessionAPI.getSnapshot(activeSession._id),
          liveSessionAPI.getMaterials({ classId, subject }),
        ])

        setSnapshot(snapshotRes?.snapshot || snapshotRes || null)
        setMaterials(materialsRes?.materials || materialsRes || [])
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load live session.')
      } finally {
        setPageLoading(false)
        setSessionLoading(false)
      }
    }

    bootstrap()
  }, [classId, subject])

  useEffect(() => {
    if (!session?._id) return

    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.emit('join:session', { sessionId: session._id })

    socket.on('session:snapshot', (payload) => {
      setSnapshot(payload?.snapshot || payload)
    })

    return () => {
      socket.disconnect()
    }
  }, [session?._id])

  const handleUploadClick = () => {
    setUploadError('')
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('classId', classId)
      formData.append('subject', subject)
      formData.append('title', file.name)
      if (session?._id) formData.append('sessionId', session._id)

      const res = await liveSessionAPI.uploadMaterial(formData)
      const created = res?.material || res
      setMaterials((prev) => [created, ...prev])
    } catch (err) {
      setUploadError(err?.response?.data?.message || err.message || 'Upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <button style={styles.backBtn} onClick={() => navigate('/teacher/classes')}>
          ← Back to classes
        </button>

        <div style={styles.topBar}>
          <div>
            <p style={styles.kicker}>Live class dashboard</p>
            <h1 style={styles.title}>{classInfo?.name || 'Class live'}</h1>
            <p style={styles.subTitle}>
              Track student interactions, manage materials, and monitor the session live.
            </p>
          </div>

          <div style={styles.topActions}>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={styles.select}
              disabled={sessionLoading}
            >
              {SUBJECT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              style={{ ...styles.uploadBtn, opacity: uploading ? 0.8 : 1 }}
              onClick={handleUploadClick}
              disabled={uploading || sessionLoading}
            >
              {uploading ? 'Uploading…' : 'Add file'}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {uploadError && <div style={styles.error}>{uploadError}</div>}

        {pageLoading ? (
          <div style={styles.loadingCard}>Loading live dashboard…</div>
        ) : (
          <>
            <div style={styles.grid}>
              <div style={styles.card}>
                <p style={styles.cardLabel}>Class score</p>
                <h2 style={styles.scoreValue}>{snapshot?.classScore ?? 0}</h2>
              </div>

              <div style={styles.card}>
                <p style={styles.cardLabel}>Trend</p>
                <h2 style={styles.cardValue}>{snapshot?.trend || 'No trend yet'}</h2>
              </div>

              <div style={styles.card}>
                <p style={styles.cardLabel}>Last event</p>
                <h2 style={styles.cardValue}>
                  {snapshot?.lastEventAt
                    ? new Date(snapshot.lastEventAt).toLocaleString()
                    : 'No event yet'}
                </h2>
              </div>
            </div>

            <div style={styles.mainLayout}>
              <div style={styles.leftCol}>
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <h3 style={styles.panelTitle}>Student live scores</h3>
                  </div>

                  {studentRows.length === 0 ? (
                    <div style={styles.emptyState}>No student activity yet.</div>
                  ) : (
                    <div style={styles.studentList}>
                      {studentRows.map((row) => (
                        <div key={row.studentId} style={styles.studentRow}>
                          <div>
                            <p style={styles.studentName}>Student {row.studentId.slice(-6)}</p>
                            <p style={styles.studentMeta}>
                              Understand: {row.counts.understand || 0} · Confused:{' '}
                              {row.counts.confused || 0} · Overwhelmed:{' '}
                              {row.counts.overwhelmed || 0} · Help: {row.counts.help || 0}
                            </p>
                          </div>
                          <div style={styles.studentScore}>{row.score}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <h3 style={styles.panelTitle}>Recommendations</h3>
                  </div>

                  {snapshot?.recommendations?.length ? (
                    <div style={styles.recoList}>
                      {snapshot.recommendations.map((rec, index) => (
                        <div key={index} style={styles.recoItem}>
                          {typeof rec === 'string' ? rec : rec?.message || JSON.stringify(rec)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyState}>No recommendations yet.</div>
                  )}
                </div>
              </div>

              <div style={styles.rightCol}>
                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <h3 style={styles.panelTitle}>Files for {subject}</h3>
                  </div>

                  {materials.length === 0 ? (
                    <div style={styles.emptyState}>No files added for this subject yet.</div>
                  ) : (
                    <div style={styles.materialList}>
                      {materials.map((item) => (
                        <a
                          key={item._id}
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.materialItem}
                        >
                          <div>
                            <p style={styles.materialTitle}>{item.title}</p>
                            <p style={styles.materialMeta}>
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span style={styles.materialArrow}>↗</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.panel}>
                  <div style={styles.panelHeader}>
                    <h3 style={styles.panelTitle}>Session info</h3>
                  </div>

                  <div style={styles.infoBox}>
                    <p>
                      <strong>Session ID:</strong> {session?._id || '—'}
                    </p>
                    <p>
                      <strong>Subject:</strong> {subject}
                    </p>
                    <p>
                      <strong>Status:</strong> {session?.status || '—'}
                    </p>
                    <p>
                      <strong>Started at:</strong>{' '}
                      {session?.startedAt ? new Date(session.startedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg,#FFF9F4 0%,#FFFDFB 45%,#F8F7FF 100%)',
    padding: '32px 24px',
    fontFamily: "'Nunito', sans-serif",
  },
  content: {
    maxWidth: 1400,
    margin: '0 auto',
  },
  backBtn: {
    border: 'none',
    background: 'transparent',
    color: '#7d75a7',
    fontWeight: 800,
    cursor: 'pointer',
    marginBottom: 18,
    fontSize: 14,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  kicker: {
    margin: 0,
    color: '#9B8EFF',
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    margin: '6px 0 8px',
    fontSize: 40,
    fontWeight: 900,
    color: '#1A1830',
    fontFamily: "'Baloo 2', cursive",
  },
  subTitle: {
    margin: 0,
    color: '#8d87a8',
    fontSize: 15,
    maxWidth: 700,
  },
  topActions: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  select: {
    height: 46,
    borderRadius: 14,
    border: '1.5px solid rgba(155,142,255,.25)',
    padding: '0 14px',
    fontWeight: 700,
    background: '#fff',
  },
  uploadBtn: {
    height: 46,
    border: 'none',
    borderRadius: 9999,
    padding: '0 18px',
    background: 'linear-gradient(135deg,#9B8EFF 0%,#74C0FC 100%)',
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
  },
  error: {
    marginBottom: 14,
    padding: '12px 14px',
    background: 'rgba(255,107,107,.08)',
    color: '#e25555',
    borderRadius: 14,
    border: '1px solid rgba(255,107,107,.16)',
    fontWeight: 700,
  },
  loadingCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 28,
    boxShadow: '0 8px 28px rgba(100,90,150,.08)',
    color: '#6b6488',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
    gap: 16,
    marginBottom: 18,
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: 22,
    boxShadow: '0 8px 28px rgba(100,90,150,.08)',
  },
  cardLabel: {
    margin: 0,
    color: '#9089ab',
    fontWeight: 800,
    fontSize: 13,
  },
  scoreValue: {
    margin: '10px 0 0',
    fontSize: 42,
    color: '#1A1830',
    fontFamily: "'Baloo 2', cursive",
  },
  cardValue: {
    margin: '10px 0 0',
    fontSize: 20,
    color: '#1A1830',
    fontWeight: 900,
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: 18,
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  panel: {
    background: '#fff',
    borderRadius: 24,
    padding: 22,
    boxShadow: '0 8px 28px rgba(100,90,150,.08)',
  },
  panelHeader: {
    marginBottom: 14,
  },
  panelTitle: {
    margin: 0,
    color: '#1A1830',
    fontSize: 22,
    fontFamily: "'Baloo 2', cursive",
  },
  emptyState: {
    padding: 16,
    borderRadius: 16,
    background: '#faf8ff',
    color: '#8d87a8',
    fontWeight: 700,
  },
  studentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  studentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    background: '#faf8ff',
  },
  studentName: {
    margin: 0,
    fontWeight: 900,
    color: '#1A1830',
  },
  studentMeta: {
    margin: '4px 0 0',
    color: '#8d87a8',
    fontSize: 13,
    lineHeight: 1.5,
  },
  studentScore: {
    minWidth: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(155,142,255,.12)',
    color: '#6a59c9',
    fontWeight: 900,
    fontSize: 18,
  },
  recoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  recoItem: {
    padding: 14,
    borderRadius: 16,
    background: '#fff8ef',
    color: '#6f6045',
    fontWeight: 700,
  },
  materialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  materialItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
    background: '#faf8ff',
    borderRadius: 16,
    padding: 14,
  },
  materialTitle: {
    margin: 0,
    color: '#1A1830',
    fontWeight: 900,
  },
  materialMeta: {
    margin: '4px 0 0',
    color: '#8d87a8',
    fontSize: 13,
  },
  materialArrow: {
    fontSize: 18,
    color: '#8f86ff',
    fontWeight: 900,
  },
  infoBox: {
    color: '#5e5877',
    lineHeight: 1.8,
    fontWeight: 700,
  },
}

export default TeacherClassLivePage