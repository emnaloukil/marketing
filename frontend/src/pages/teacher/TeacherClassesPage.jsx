import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ClassCard from '../../components/teacher/ClassCard'
import AddClassModal from '../../components/teacher/AddClassModal'
import { useAuth, extractUserId } from '../../context/AuthContext'
import { classesAPI } from '../../api/client'

const safeStoredUser = () => {
  try {
    const raw = localStorage.getItem('ek_user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const TeacherClassesPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const teacherId = extractUserId(user) || extractUserId(safeStoredUser())

  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [hovAddBtn, setHovAddBtn] = useState(false)

  useEffect(() => {
    if (authLoading) return

    const fetchClasses = async () => {
      setLoading(true)
      setApiError('')

      try {
        if (!teacherId) {
          setApiError('Session expirée. Reconnectez-vous.')
          return
        }

        const res = await classesAPI.getByTeacher(teacherId)
        const data = res?.classes || res?.data || res || []
        setClasses(Array.isArray(data) ? data : [])
      } catch (err) {
        setApiError(err.message || 'Impossible de charger les classes.')
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [teacherId, authLoading])

  const visibleClasses = useMemo(
    () =>
      classes.filter((c) =>
        (c?.name || '').toLowerCase().includes(search.toLowerCase())
      ),
    [classes, search]
  )

  const totalStudents = classes.reduce((s, c) => s + (c.studentCount || 0), 0)

  const handleAddClass = (created) => {
    setClasses((prev) => [created, ...prev])
    setShowModal(false)
  }

  const handleDeleteClass = async (id) => {
    if (!id || !window.confirm('Delete this class?')) return

    try {
      await classesAPI.delete(id)
      setClasses((prev) => prev.filter((c) => (c._id || c.id) !== id))
    } catch (err) {
      setApiError(err.message || 'Failed to delete.')
    }
  }

  const handleOpenClass = (cls) => {
    navigate(`/teacher/class/${cls._id || cls.id}/live`, { state: { cls } })
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes shimmer  { 0%,100%{opacity:.45} 50%{opacity:.9} }
        .ek-search:focus    { border-color:#9B8EFF!important; box-shadow:0 0 0 3px rgba(155,142,255,.15); outline:none; }
      `}</style>

      <div style={p.root}>
        <div style={p.content}>
          <div style={p.pageHeader}>
            <div>
              <div style={p.badge}>🏫 My Classes</div>
              <h1 style={p.pageTitle}>My Classes</h1>
              <p style={p.pageSub}>
                {loading
                  ? '…'
                  : `${classes.length} class${classes.length !== 1 ? 'es' : ''} · ${totalStudents} student${totalStudents !== 1 ? 's' : ''} in total`}
              </p>
            </div>

            <button
              style={{
                ...p.addBtn,
                boxShadow: hovAddBtn
                  ? '0 10px 32px rgba(155,142,255,.45)'
                  : '0 4px 16px rgba(155,142,255,.28)',
                transform: hovAddBtn
                  ? 'translateY(-2px) scale(1.04)'
                  : 'scale(1)',
              }}
              onMouseEnter={() => setHovAddBtn(true)}
              onMouseLeave={() => setHovAddBtn(false)}
              onClick={() => setShowModal(true)}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span> Add Class
            </button>
          </div>

          <div style={p.toolbar}>
            <div style={p.searchWrap}>
              <span style={p.searchIcon}>🔍</span>
              <input
                className="ek-search"
                style={p.searchInput}
                placeholder="Search a class…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button style={p.clearBtn} onClick={() => setSearch('')}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {apiError && <div style={p.errorBanner}>⚠️ {apiError}</div>}

          {loading ? (
            <div style={p.grid}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={sk.card}>
                  <div style={sk.top} />
                  <div style={sk.line} />
                  <div style={{ ...sk.line, width: '60%' }} />
                </div>
              ))}
            </div>
          ) : visibleClasses.length > 0 ? (
            <div style={p.grid}>
              {visibleClasses.map((cls) => (
                <ClassCard
                  key={cls._id || cls.id}
                  cls={cls}
                  onClick={handleOpenClass}
                  onDelete={handleDeleteClass}
                />
              ))}
              <GhostCard onClick={() => setShowModal(true)} />
            </div>
          ) : (
            <EmptyState
              search={search}
              onAdd={() => setShowModal(true)}
              onClear={() => setSearch('')}
            />
          )}
        </div>
      </div>

      {showModal && (
        <AddClassModal
          onSave={handleAddClass}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

const GhostCard = ({ onClick }) => {
  const [hov, setHov] = useState(false)

  return (
    <div
      style={{
        ...p.ghostCard,
        background: hov ? 'rgba(155,142,255,.06)' : 'rgba(248,247,255,.5)',
        border: hov
          ? '2px dashed #9B8EFF'
          : '2px dashed rgba(200,196,220,.40)',
        transform: hov ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <div
        style={{
          ...p.ghostIcon,
          background: hov ? 'rgba(155,142,255,.14)' : 'rgba(200,196,220,.15)',
          color: hov ? '#9B8EFF' : '#C8C4DC',
        }}
      >
        ＋
      </div>
      <p style={{ ...p.ghostText, color: hov ? '#9B8EFF' : '#C8C4DC' }}>
        Add a class
      </p>
    </div>
  )
}

const EmptyState = ({ search, onAdd, onClear }) => (
  <div style={p.emptyState}>
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <span style={{ fontSize: 56 }}>🏫</span>
      <div style={p.emptyBlob} />
    </div>

    <h3 style={p.emptyTitle}>
      {search ? `No class found for "${search}"` : 'No classes yet'}
    </h3>

    <p style={p.emptySub}>
      {search
        ? 'Try another search or create a new class.'
        : 'Create your first class to get started.'}
    </p>

    <div
      style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {search && (
        <button style={p.secBtn} onClick={onClear}>
          Clear search
        </button>
      )}
      <button style={p.primBtn} onClick={onAdd}>
        ＋ Create a class
      </button>
    </div>
  </div>
)

const p = {
  root: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(180deg,#FFF9F4 0%,#FFFDFB 50%,#F8F7FF 100%)',
    fontFamily: "'Nunito',sans-serif",
  },
  content: {
    width: '100%',
    maxWidth: 1500,
    margin: '0 auto',
    padding: '56px 40px 48px',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 20,
    animation: 'fadeInUp .3s ease both',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 14px',
    background: 'rgba(155,142,255,.10)',
    border: '1.5px solid rgba(155,142,255,.20)',
    borderRadius: 9999,
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#9B8EFF',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: "'Baloo 2',cursive",
    fontSize: 'clamp(2rem,4vw,3.2rem)',
    fontWeight: 800,
    color: '#1A1830',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    margin: 0,
  },
  pageSub: {
    fontSize: '0.92rem',
    fontWeight: 500,
    color: '#9E99B8',
    margin: '4px 0 0',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 26px',
    borderRadius: 9999,
    border: 'none',
    background: 'linear-gradient(135deg,#9B8EFF 0%,#74C0FC 100%)',
    color: '#fff',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.95rem',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 280ms cubic-bezier(0.34,1.56,0.64,1)',
  },
  toolbar: {
    display: 'flex',
    gap: 14,
    marginBottom: 28,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    fontSize: 15,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: 48,
    padding: '0 38px 0 40px',
    borderRadius: 9999,
    border: '1.5px solid rgba(200,196,220,.30)',
    background: 'rgba(255,255,255,.88)',
    backdropFilter: 'blur(8px)',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#1A1830',
    transition: 'border-color 200ms,box-shadow 200ms',
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 11,
    color: '#C8C4DC',
    fontWeight: 700,
    padding: '2px 4px',
  },
  errorBanner: {
    marginBottom: 18,
    padding: '12px 16px',
    borderRadius: 14,
    background: 'rgba(255,107,107,.08)',
    border: '1.5px solid rgba(255,107,107,.18)',
    color: '#FF6B6B',
    fontWeight: 700,
    fontSize: '0.88rem',
    animation: 'fadeInUp .2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
    gap: 24,
    width: '100%',
  },
  ghostCard: {
    borderRadius: 22,
    padding: '36px 20px',
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    cursor: 'pointer',
    transition: 'all 280ms cubic-bezier(0.34,1.56,0.64,1)',
  },
  ghostIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 300,
    transition: 'all 250ms ease',
  },
  ghostText: {
    fontFamily: "'Baloo 2',cursive",
    fontSize: '1rem',
    fontWeight: 700,
    transition: 'color 250ms',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '64px 24px',
    gap: 16,
  },
  emptyBlob: {
    position: 'absolute',
    inset: '-16px',
    borderRadius: '50%',
    background: 'rgba(155,142,255,.10)',
    zIndex: -1,
    filter: 'blur(20px)',
  },
  emptyTitle: {
    fontFamily: "'Baloo 2',cursive",
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#1A1830',
    margin: 0,
  },
  emptySub: {
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.88rem',
    fontWeight: 500,
    color: '#9E99B8',
    maxWidth: 400,
    lineHeight: 1.6,
    margin: 0,
  },
  primBtn: {
    padding: '12px 28px',
    borderRadius: 9999,
    border: 'none',
    background: 'linear-gradient(135deg,#9B8EFF 0%,#74C0FC 100%)',
    color: '#fff',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.88rem',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(155,142,255,.30)',
  },
  secBtn: {
    padding: '12px 22px',
    borderRadius: 9999,
    border: '1.5px solid rgba(200,196,220,.35)',
    background: 'rgba(248,247,255,.8)',
    color: '#9E99B8',
    fontFamily: "'Nunito',sans-serif",
    fontSize: '0.88rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
}

const sk = {
  card: {
    borderRadius: 22,
    padding: 24,
    background: '#fff',
    border: '1.5px solid rgba(200,196,220,.20)',
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  top: {
    height: 80,
    borderRadius: 14,
    background: '#f0eeff',
    animation: 'shimmer 1.4s ease infinite',
  },
  line: {
    height: 14,
    borderRadius: 8,
    background: '#f0eeff',
    animation: 'shimmer 1.4s ease infinite',
  },
}

export default TeacherClassesPage