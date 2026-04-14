// src/components/teacher/AddClassModal.jsx
import { useState } from 'react'
import { useAuth, extractUserId } from '../../context/AuthContext'
import { classesAPI } from '../../api/client'

const ICONS = [
  { key: 'numbers', emoji: '🔢', label: 'Maths' },
  { key: 'book', emoji: '📘', label: 'Lecture' },
  { key: 'science', emoji: '🧪', label: 'Sciences' },
  { key: 'art', emoji: '🎨', label: 'Art' },
  { key: 'music', emoji: '🎵', label: 'Musique' },
  { key: 'sport', emoji: '⚽', label: 'Sport' },
  { key: 'globe', emoji: '🌍', label: 'Géographie' },
  { key: 'computer', emoji: '💻', label: 'Informatique' },
]

const safeStoredUser = () => {
  try {
    const raw = localStorage.getItem('ek_user')
    if (!raw || raw === 'undefined' || raw === 'null') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const AddClassModal = ({ onSave, onClose }) => {
  const { user, loading } = useAuth()
  const teacherId = extractUserId(user) || extractUserId(safeStoredUser())

  const [className, setClassName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('book')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    if (!className.trim()) {
      setError('Class name is required.')
      return
    }

    if (!teacherId) {
      console.error('teacherId missing — user:', user)
      setError('Session expired. Please log out and log in again.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        teacherId,
        name: className.trim(),
        icon: selectedIcon,
      }

      console.log('Creating class with payload:', payload)

      const created = await classesAPI.create(payload)
      onSave(created?.class || created?.data || created)
      onClose()
    } catch (err) {
      console.error('Create class error:', err)
      setError(err.message || 'Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        @keyframes sheetUp   { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes spin      { to{transform:rotate(360deg)} }

        .ek-modal-input:focus {
          border-color:#9B8EFF!important;
          box-shadow:0 0 0 3px rgba(155,142,255,.15);
          outline:none;
        }

        .ek-icon-btn:hover:not(.active) {
          border-color:rgba(155,142,255,.5)!important;
          background:rgba(155,142,255,.05)!important;
        }

        .ek-cancel:hover {
          background:#F3F0FF!important;
          color:#9B8EFF!important;
        }
      `}</style>

      <div style={s.overlay} onClick={onClose}>
        <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
          <div style={s.header}>
            <div style={s.headerLeft}>
              <div style={s.badge}>🏫</div>
              <div>
                <h2 style={s.title}>Add Class</h2>
                <p style={s.subtitle}>Fill in the information below</p>
              </div>
            </div>

            <button type="button" style={s.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>
                Class Name <span style={{ color: '#9B8EFF' }}>*</span>
              </label>

              <input
                className="ek-modal-input"
                type="text"
                value={className}
                onChange={(e) => {
                  setClassName(e.target.value)
                  setError('')
                }}
                placeholder='E.g. "Grade 5-A"'
                style={s.input}
                autoFocus
              />

              {error && <p style={s.errorMsg}>⚠ {error}</p>}
            </div>

            <div style={s.actions}>
              <button
                type="button"
                className="ek-cancel"
                style={s.cancelBtn}
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{ ...s.saveBtn, opacity: saving ? 0.8 : 1 }}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span style={s.spinner} /> Creating…
                  </>
                ) : (
                  'Create Class'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(20,16,48,.50)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000,
    animation: 'overlayIn .18s ease',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    background: '#fff',
    borderRadius: 28,
    padding: '28px 28px 24px',
    boxShadow: '0 32px 80px rgba(80,60,160,.18)',
    fontFamily: "'Nunito',sans-serif",
    animation: 'sheetUp .22s cubic-bezier(0.34,1.56,0.64,1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    flexShrink: 0,
    background:
      'linear-gradient(135deg,rgba(155,142,255,.15),rgba(116,192,252,.15))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  title: {
    margin: 0,
    fontFamily: "'Baloo 2',cursive",
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#1A1830',
    lineHeight: 1.2,
  },
  subtitle: {
    margin: '3px 0 0',
    fontSize: '0.78rem',
    color: '#A09AB8',
    fontWeight: 500,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1.5px solid rgba(200,196,220,.35)',
    background: '#F8F7FF',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#9E99B8',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: '#5C577A',
    letterSpacing: '0.01em',
  },
  input: {
    height: 52,
    borderRadius: 14,
    border: '1.5px solid rgba(155,142,255,.25)',
    padding: '0 16px',
    fontSize: '0.95rem',
    fontFamily: "'Nunito',sans-serif",
    fontWeight: 600,
    color: '#1A1830',
    background: '#FAFAFE',
    transition: 'border-color 200ms,box-shadow 200ms',
    width: '100%',
    boxSizing: 'border-box',
  },
  errorMsg: {
    margin: 0,
    color: '#FF6B6B',
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4,1fr)',
    gap: 8,
  },
  iconBtn: {
    padding: '10px 6px',
    borderRadius: 12,
    border: '1.5px solid rgba(200,196,220,.30)',
    background: '#F8F7FF',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    transition: 'all 180ms ease',
  },
  iconBtnActive: {
    border: '2px solid #9B8EFF',
    background: 'rgba(155,142,255,.08)',
    boxShadow: '0 2px 12px rgba(155,142,255,.20)',
  },
  iconEmoji: {
    fontSize: '1.5rem',
    lineHeight: 1,
  },
  iconLabel: {
    fontSize: '0.62rem',
    fontFamily: "'Nunito',sans-serif",
    transition: 'color 180ms',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 4,
  },
  cancelBtn: {
    padding: '11px 20px',
    borderRadius: 9999,
    border: '1.5px solid rgba(200,196,220,.40)',
    background: '#fff',
    color: '#9E99B8',
    fontFamily: "'Nunito',sans-serif",
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },
  saveBtn: {
    padding: '11px 22px',
    borderRadius: 9999,
    border: 'none',
    background: 'linear-gradient(135deg,#9B8EFF 0%,#74C0FC 100%)',
    color: '#fff',
    fontFamily: "'Nunito',sans-serif",
    fontWeight: 800,
    fontSize: '0.88rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 4px 16px rgba(155,142,255,.30)',
    transition: 'opacity 180ms',
  },
  spinner: {
    width: 13,
    height: 13,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,.35)',
    borderTopColor: '#fff',
    display: 'inline-block',
    animation: 'spin .7s linear infinite',
  },
}

export default AddClassModal