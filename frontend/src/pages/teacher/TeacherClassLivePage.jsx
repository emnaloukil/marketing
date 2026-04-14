import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { liveAPI, materialsAPI } from '../../api/liveApi'
import AddFileModal from '../../components/live/AddFileModal'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const SUBJECT_CFG = {
  mathematics: { color: '#9B8EFF', light: '#F3F0FF', emoji: '🔢', label: 'Mathematics' },
  reading: { color: '#FF6B6B', light: '#FFF0F0', emoji: '📖', label: 'Reading' },
  sciences: { color: '#4ECDC4', light: '#F0FFFE', emoji: '🔬', label: 'Sciences' },
}

const TREND_CFG = {
  improving: { color: '#4ECDC4', label: '↑ Improving' },
  stable_good: { color: '#9B8EFF', label: '→ Stable (good)' },
  stable_bad: { color: '#FFB347', label: '→ Stagnating' },
  degrading: { color: '#FF6B6B', label: '↓ Degrading' },
  recovering: { color: '#FFB347', label: '↗ Recovering' },
}

export default function TeacherClassLivePage() {
  const { classId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const sessionRef = useRef(null)

  const cls = state?.cls || {
    id: classId,
    _id: classId,
    name: classId,
    emoji: '🏫',
    color: '#9B8EFF',
  }

  const storedUser = JSON.parse(localStorage.getItem('ek_user') || '{}')
  const teacherId = storedUser?._id || storedUser?.id || ''

  const [subject, setSubject] = useState('')
  const [session, setSession] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [materials, setMaterials] = useState([])
  const [socketStatus, setSocketStatus] = useState('disconnected')
  const [showFileModal, setShowFileModal] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [error, setError] = useState('')
  const [ending, setEnding] = useState(false)

  const normalizedClassId = cls?._id || cls?.id || classId
  const sc = SUBJECT_CFG[subject] || SUBJECT_CFG.mathematics

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      if (sessionRef.current) {
        socketRef.current.emit('teacher:leaveSession', { sessionId: sessionRef.current })
      }
      socketRef.current.disconnect()
      socketRef.current = null
      sessionRef.current = null
    }
    setSocketStatus('disconnected')
  }, [])

  const connectSocket = useCallback(
    (sessionId) => {
      cleanupSocket()

      const socket = io(SOCKET_URL, { transports: ['websocket'] })
      socketRef.current = socket
      sessionRef.current = sessionId

      socket.on('connect', () => {
        setSocketStatus('connected')
        socket.emit('teacher:joinSession', { sessionId })
      })

      socket.on('disconnect', () => {
        setSocketStatus('disconnected')
      })

      socket.on('dashboard:init', ({ snapshot: snap }) => {
        setSnapshot(snap || null)
      })

      socket.on('dashboard:update', (payload) => {
        const snap = payload?.snapshot || payload
        if (!snap) return

        setSnapshot({
          classScore: snap.classScore ?? 0,
          classScoreHistory: snap.classScoreHistory || [],
          studentScores: snap.studentScores || {},
          countsByStudent: snap.countsByStudent || {},
          breakdown: snap.breakdown || {},
          trend: snap.trend || null,
          recommendations: snap.recommendations || [],
          lastEventAt: snap.lastEventAt || snap.lastEvent?.timestamp || null,
        })
      })

      socket.on('session:ended', () => {
        setSessionEnded(true)
        setSession((prev) => (prev ? { ...prev, status: 'ended' } : prev))
      })

      socket.on('session:error', ({ message }) => {
        setError(message || 'Erreur socket')
      })
    },
    [cleanupSocket]
  )

  const loadForSubject = useCallback(
    async (selectedSubject) => {
      if (!teacherId || !normalizedClassId || !selectedSubject) {
        return
      }

      setLoading(true)
      setLoadingFiles(true)
      setError('')
      setSnapshot(null)
      setSession(null)
      setSessionEnded(false)
      setMaterials([])

      try {
        const res = await liveAPI.startOrGet({
          teacherId,
          classId: normalizedClassId,
          subject: selectedSubject,
        })

        const payload = res?.data || res

        const sess = {
          _id: payload?.sessionId,
          teacherId: payload?.teacherId,
          classId: payload?.classId,
          subject: payload?.subject,
          status: payload?.status,
          startedAt: payload?.startedAt,
          endedAt: payload?.endedAt || null,
        }

        if (!sess._id) {
          throw new Error('sessionId introuvable dans la réponse backend.')
        }

        setSession(sess)
        setSnapshot(payload?.snapshot || null)

        connectSocket(sess._id)

        const mRes = await materialsAPI.get(normalizedClassId, selectedSubject, teacherId)
        setMaterials(mRes?.data || mRes?.materials || [])
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Impossible de charger la session.'
        )
      } finally {
        setLoading(false)
        setLoadingFiles(false)
      }
    },
    [teacherId, normalizedClassId, connectSocket]
  )

  useEffect(() => {
    return () => {
      cleanupSocket()
    }
  }, [cleanupSocket])

  const handleSubjectChange = (e) => {
    setSubject(e.target.value)
    setError('')
  }

  const handleStartSession = async () => {
    if (!subject) {
      setError('Choisissez une matière avant de démarrer la session.')
      return
    }
    await loadForSubject(subject)
  }

  const handleEndSession = async () => {
    if (!session?._id || sessionEnded) return

    setEnding(true)
    setError('')

    try {
      await liveAPI.endSession(session._id)
      setSessionEnded(true)
      setSession((prev) =>
        prev ? { ...prev, status: 'ended', endedAt: new Date().toISOString() } : prev
      )
      cleanupSocket()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Erreur fin de session')
    } finally {
      setEnding(false)
    }
  }

  const handleFileSaved = (newFile) => {
    setMaterials((prev) => [newFile, ...prev])
    setShowFileModal(false)
  }

  const handleDeleteFile = async (id) => {
    if (!window.confirm('Supprimer ce fichier ?')) return

    try {
      await materialsAPI.remove(id)
      setMaterials((prev) => prev.filter((m) => m._id !== id))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Erreur suppression fichier')
    }
  }

  return (
    <div style={s.root}>
      <div style={{ ...s.blob, background: `${sc.color}20`, top: -80, left: -100 }} />
      <div style={{ ...s.blob, background: 'rgba(255,179,71,0.15)', bottom: -60, right: -80 }} />

      <div style={s.wrap}>
        <div style={s.topBar}>
          <button style={s.backBtn} onClick={() => navigate('/teacher/classes')}>
            ← Mes classes
          </button>

          <div style={s.classInfo}>
            <div style={{ ...s.classIcon, background: `${cls.color || sc.color}18` }}>
              <span style={{ fontSize: 22 }}>{cls.emoji || '🏫'}</span>
            </div>
            <div>
              <p style={s.className}>{cls.name}</p>
              <p style={s.classMeta}>{cls.level || ''}</p>
            </div>
          </div>

          <div
            style={{
              ...s.socketPill,
              background:
                socketStatus === 'connected'
                  ? 'rgba(78,205,196,0.10)'
                  : 'rgba(200,196,220,0.12)',
              border: `1.5px solid ${
                socketStatus === 'connected'
                  ? 'rgba(78,205,196,0.28)'
                  : 'rgba(200,196,220,0.25)'
              }`,
            }}
          >
            <span
              style={{
                ...s.socketDot,
                background: socketStatus === 'connected' ? '#4ECDC4' : '#C8C4DC',
              }}
            />
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: socketStatus === 'connected' ? '#4ECDC4' : '#9E99B8',
              }}
            >
              {socketStatus === 'connected' ? 'Live' : 'Not started'}
            </span>
          </div>

          <div style={{ ...s.selectWrap, borderColor: `${sc.color}40` }}>
            <span>{subject ? sc.emoji : '📚'}</span>
            <select value={subject} onChange={handleSubjectChange} style={{ ...s.select, color: subject ? sc.color : '#9E99B8' }}>
              <option value="">Choose subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="reading">Reading</option>
              <option value="sciences">Sciences</option>
            </select>
          </div>

          {!session && (
            <button
              style={{
                ...s.startBtn,
                background: subject
                  ? `linear-gradient(135deg,${sc.color},${sc.color}BB)`
                  : 'linear-gradient(135deg,#C8C4DC,#B8B2D1)',
              }}
              onClick={handleStartSession}
            >
              ▶ Start session
            </button>
          )}

          <button
            style={{
              ...s.addFileBtn,
              background: `linear-gradient(135deg,${sc.color},${sc.color}BB)`,
              boxShadow: `0 4px 14px ${sc.color}35`,
            }}
            onClick={() => setShowFileModal(true)}
            disabled={!session}
          >
            📎 Add file
          </button>

          {session && !sessionEnded && (
            <button style={s.endBtn} onClick={handleEndSession} disabled={ending}>
              {ending ? '⏳' : '⏹'} End session
            </button>
          )}
        </div>

        {error && (
          <div style={s.errorBanner}>
            ⚠️ {error}
            <button style={s.errorClose} onClick={() => setError('')}>
              ✕
            </button>
          </div>
        )}

        {sessionEnded && (
          <div style={s.endedBanner}>
            <span style={{ fontSize: 20 }}>🏁</span>
            <div>
              <p style={s.endedTitle}>Session terminée</p>
              <p style={s.endedSub}>Les résumés parents seront générés ce soir.</p>
            </div>
            <button
              style={s.newSessBtn}
              onClick={() => {
                setSession(null)
                setSnapshot(null)
                setSessionEnded(false)
              }}
            >
              Nouvelle session
            </button>
          </div>
        )}

        {loading && (
          <div style={s.loadingCenter}>
            <span style={s.spinner} />
            <p style={s.loadingText}>Démarrage de la session…</p>
          </div>
        )}

        {!loading && (
          <div style={s.grid}>
            <div style={s.leftCol}>
              <ScoreCard snapshot={snapshot} sc={sc} />
              <StudentGrid snapshot={snapshot} />
              <ButtonsCard snapshot={snapshot} />
            </div>

            <div style={s.rightCol}>
              <FilesCard
                materials={materials}
                loading={loadingFiles}
                sc={sc}
                onAdd={() => setShowFileModal(true)}
                onDelete={handleDeleteFile}
              />
              <RecsCard snapshot={snapshot} sc={sc} />
            </div>
          </div>
        )}
      </div>

      {showFileModal && session && (
        <AddFileModal
          classId={normalizedClassId}
          teacherId={teacherId}
          subject={subject}
          sessionId={session._id}
          onSave={handleFileSaved}
          onClose={() => setShowFileModal(false)}
          sc={sc}
        />
      )}
    </div>
  )
}

function ScoreCard({ snapshot, sc }) {
  const tc = TREND_CFG[snapshot?.trend]
  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <span style={s.cardTitle}>📊 Class Score</span>
        {tc && (
          <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: 9999, color: tc.color, background: `${tc.color}14` }}>
            {tc.label}
          </span>
        )}
      </div>
      {!snapshot ? (
        <p style={s.emptyText}>Waiting for first interaction…</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: '3.2rem', fontWeight: 800, color: sc.color, lineHeight: 1 }}>
              {snapshot.classScore ?? 0}
            </span>
            <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.1rem', color: '#C8C4DC', fontWeight: 600 }}>/100</span>
          </div>

          {snapshot.classScoreHistory?.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56 }}>
              {snapshot.classScoreHistory.slice(-8).map((v, i, arr) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: `${(v / 100) * 48}px`, minHeight: 3, background: i === arr.length - 1 ? sc.color : `${sc.color}50`, borderRadius: '4px 4px 0 0', transition: 'height 400ms ease' }} />
                  <span style={{ fontSize: '0.58rem', color: '#B0AACB', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StudentGrid({ snapshot }) {
  if (!snapshot?.studentScores) return null
  const entries = Object.entries(snapshot.studentScores)
  if (!entries.length) return null

  const bd = snapshot.breakdown || {}
  const alertIds = bd.alert?.studentIds || []
  const warningIds = bd.warning?.studentIds || []

  const colorFor = (id) =>
    alertIds.includes(id) ? '#FF6B6B' : warningIds.includes(id) ? '#FFB347' : '#4ECDC4'

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <span style={s.cardTitle}>👥 Student Scores</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(68px,1fr))', gap: 8 }}>
        {entries.map(([id, score]) => {
          const c = colorFor(id)
          return (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '9px 6px', borderRadius: 12, border: `1.5px solid ${c}25`, background: `${c}06`, gap: 3 }}>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.62rem', fontWeight: 700, color: '#9E99B8' }}>
                #{id.slice(-4).toUpperCase()}
              </span>
              <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.15rem', fontWeight: 800, color: c, lineHeight: 1 }}>
                {score ?? '–'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ButtonsCard({ snapshot }) {
  if (!snapshot?.countsByStudent) return null
  const totals = { understand: 0, confused: 0, overwhelmed: 0, help: 0 }

  Object.values(snapshot.countsByStudent).forEach((c) =>
    Object.entries(c).forEach(([k, v]) => {
      if (k in totals) totals[k] += v
    })
  )

  const grand = Object.values(totals).reduce((a, b) => a + b, 0)
  if (!grand) return null

  const rows = [
    { key: 'understand', label: '✅ Understand', color: '#4ECDC4' },
    { key: 'confused', label: '❓ Confused', color: '#FFB347' },
    { key: 'overwhelmed', label: '😰 Overwhelmed', color: '#9B8EFF' },
    { key: 'help', label: '🆘 Help', color: '#FF6B6B' },
  ]

  return (
    <div style={s.card}>
      <p style={{ ...s.cardTitle, marginBottom: 14 }}>🎮 Button Presses · {grand}</p>
      {rows.map((r) => {
        const n = totals[r.key] || 0
        const pct = grand ? Math.round((n / grand) * 100) : 0
        return (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#706C8A', width: 100, flexShrink: 0 }}>
              {r.label}
            </span>
            <div style={{ flex: 1, height: 6, background: '#F0EEF8', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: r.color, borderRadius: 9999, transition: 'width 500ms ease' }} />
            </div>
            <span style={{ fontFamily: "'Baloo 2',cursive", fontSize: '0.82rem', fontWeight: 800, color: r.color, minWidth: 22, textAlign: 'right' }}>
              {n}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function FilesCard({ materials, loading, sc, onAdd, onDelete }) {
  const icon = (url = '') =>
    url.endsWith('.pdf')
      ? '📄'
      : url.match(/\.(png|jpg|jpeg)$/)
        ? '🖼️'
        : url.includes('drive')
          ? '📂'
          : '📎'

  return (
    <div style={s.card}>
      <div style={s.cardHead}>
        <span style={s.cardTitle}>
          {sc.emoji} Files · {sc.label}
        </span>
        <button style={{ ...s.miniBtn, color: sc.color, background: `${sc.color}12`, border: `1.5px solid ${sc.color}25` }} onClick={onAdd}>
          + Add
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 0' }}>
          <span style={s.spinner} />
          <span style={s.loadingText}>Loading files…</span>
        </div>
      ) : materials.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={s.emptyText}>No files yet for {sc.label}.</p>
          <button style={{ ...s.miniBtn, color: sc.color, background: `${sc.color}10`, border: `1.5px solid ${sc.color}20`, marginTop: 8 }} onClick={onAdd}>
            + Add first file
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {materials.map((m) => (
            <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, background: 'rgba(248,247,255,0.6)', border: '1px solid rgba(200,196,220,0.15)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${sc.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>{icon(m.fileUrl)}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#1A1830', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.title}
                </p>
                <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.70rem', color: sc.color, fontWeight: 600, textDecoration: 'none' }}>
                  Ouvrir ↗
                </a>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.45, fontSize: 14 }} onClick={() => onDelete(m._id)}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecsCard({ snapshot, sc }) {
  if (!snapshot?.recommendations?.length) return null
  const typeColors = {
    urgent: '#FF6B6B',
    pedagogique: '#9B8EFF',
    encouragement: '#4ECDC4',
    approche: '#FFB347',
  }

  return (
    <div style={s.card}>
      <p style={{ ...s.cardTitle, marginBottom: 14 }}>💡 Recommendations</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {snapshot.recommendations.map((rec, i) => {
          const msg = typeof rec === 'string' ? rec : rec.message
          const type = typeof rec === 'object' ? rec.type : null
          const color = typeColors[type] || sc.color
          return (
            <div key={i} style={{ padding: '10px 13px', borderRadius: 10, borderLeft: `3px solid ${color}`, background: `${color}07` }}>
              <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.82rem', fontWeight: 500, color: '#4A4666', lineHeight: 1.55, marginBottom: type ? 4 : 0 }}>
                {msg}
              </p>
              {type && (
                <span style={{ fontSize: '0.66rem', fontWeight: 800, color, background: `${color}12`, padding: '2px 8px', borderRadius: 9999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {type}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg,#FFF9F4 0%,#FFFDFB 50%,#F8F7FF 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Nunito',sans-serif",
  },
  blob: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.5,
    zIndex: 0,
    width: 280,
    height: 280,
  },
  wrap: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1380,
    margin: '0 auto',
    padding: '24px 24px 48px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 22,
    background: 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(16px)',
    borderRadius: 20,
    padding: '13px 20px',
    border: '1.5px solid rgba(255,255,255,0.92)',
    boxShadow: '0 4px 20px rgba(100,90,150,0.07)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#9E99B8',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  classInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  classIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  className: {
    fontFamily: "'Baloo 2',cursive",
    fontSize: '1.10rem',
    fontWeight: 800,
    color: '#1A1830',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  classMeta: {
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.72rem',
    color: '#9E99B8',
    fontWeight: 500,
    margin: 0,
  },
  socketPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 13px',
    borderRadius: 9999,
    whiteSpace: 'nowrap',
  },
  socketDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 300ms ease',
  },
  selectWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(248,247,255,0.9)',
    border: '1.5px solid',
    borderRadius: 12,
    padding: '0 14px',
    height: 42,
  },
  select: {
    background: 'none',
    border: 'none',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
  },
  startBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 9999,
    border: 'none',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.84rem',
    fontWeight: 800,
    color: '#fff',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  addFileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    borderRadius: 9999,
    border: 'none',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.84rem',
    fontWeight: 800,
    color: '#fff',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 250ms ease',
  },
  endBtn: {
    padding: '9px 18px',
    borderRadius: 9999,
    border: '1.5px solid rgba(255,107,107,0.30)',
    background: 'rgba(255,107,107,0.08)',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.80rem',
    fontWeight: 700,
    color: '#FF6B6B',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 18px',
    background: 'rgba(255,107,107,0.08)',
    border: '1.5px solid rgba(255,107,107,0.22)',
    borderRadius: 14,
    marginBottom: 16,
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.84rem',
    fontWeight: 700,
    color: '#FF6B6B',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#FF6B6B',
    fontWeight: 800,
    fontSize: 13,
  },
  endedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '13px 18px',
    background: 'rgba(78,205,196,0.08)',
    border: '1.5px solid rgba(78,205,196,0.22)',
    borderRadius: 16,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  endedTitle: {
    fontFamily: "'Baloo 2',cursive",
    fontSize: '0.94rem',
    fontWeight: 800,
    color: '#4ECDC4',
    margin: 0,
  },
  endedSub: {
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.76rem',
    color: '#9E99B8',
    margin: 0,
  },
  newSessBtn: {
    marginLeft: 'auto',
    padding: '9px 20px',
    borderRadius: 9999,
    border: 'none',
    background: 'linear-gradient(135deg,#4ECDC4,#44B8B0)',
    color: '#fff',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.82rem',
    fontWeight: 800,
    cursor: 'pointer',
  },
  loadingCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: '60px 0',
  },
  loadingText: {
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.88rem',
    color: '#9E99B8',
    fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 20,
    alignItems: 'start',
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
  card: {
    background: 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(16px)',
    borderRadius: 20,
    padding: '18px 20px',
    border: '1.5px solid rgba(255,255,255,0.92)',
    boxShadow: '0 4px 24px rgba(100,90,150,0.08)',
    animation: 'fadeInUp 0.4s ease both',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontFamily: "'Baloo 2',cursive",
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#1A1830',
    letterSpacing: '-0.01em',
    margin: 0,
  },
  emptyText: {
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.82rem',
    color: '#B0AACB',
    fontWeight: 500,
    textAlign: 'center',
  },
  miniBtn: {
    padding: '5px 14px',
    borderRadius: 9999,
    fontSize: '0.76rem',
    fontWeight: 800,
    fontFamily: "'Nunito',sans-serif",
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  spinner: {
    display: 'block',
    width: 18,
    height: 18,
    border: '2px solid rgba(155,142,255,0.2)',
    borderTop: '2px solid #9B8EFF',
    borderRadius: '50%',
    animation: 'spin 0.65s linear infinite',
    flexShrink: 0,
  },
}