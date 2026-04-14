import { useState, useEffect, useRef } from 'react'
import { materialsAPI } from '../../api/liveApi'

export default function AddFileModal({ classId, teacherId, subject, sessionId, onSave, onClose, sc }) {
  const [title,   setTitle]   = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [done,    setDone]    = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 80)
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleSave = async () => {
    if (!title.trim())   { setError('Le titre est requis'); return }
    if (!fileUrl.trim()) { setError("L'URL est requise");  return }
    setSaving(true); setError('')
    try {
      const res = await materialsAPI.add({ teacherId, classId, subject, title: title.trim(), fileUrl: fileUrl.trim(), sessionId: sessionId || null })
      setDone(true)
      setTimeout(() => onSave(res.data), 600)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={ms.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ms.modal}>

        {/* Header */}
        <div style={ms.header}>
          <div>
            <div style={{ ...ms.pill, color: sc.color, background: `${sc.color}14`, border: `1.5px solid ${sc.color}28` }}>
              {sc.emoji} {sc.label}
            </div>
            <h2 style={ms.title}>Ajouter un fichier</h2>
            <p style={ms.sub}>Ce fichier sera visible pour les élèves de cette classe.</p>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <div style={ms.form}>
          {/* Titre */}
          <div style={ms.field}>
            <label style={ms.label}>Titre <span style={{ color: '#FF6B6B' }}>*</span></label>
            <div style={{ ...ms.inputBox, borderColor: title ? sc.color : '#E2DFF2', boxShadow: title ? `0 0 0 4px ${sc.color}12` : 'none' }}>
              <span style={ms.ico}>📄</span>
              <input ref={ref} style={ms.input} value={title} onChange={e => { setTitle(e.target.value); setError('') }}
                placeholder='Ex: "Exercice fractions – Leçon 3"' maxLength={120} onKeyDown={e => e.key === 'Enter' && handleSave()} />
            </div>
          </div>

          {/* URL */}
          <div style={ms.field}>
            <label style={ms.label}>URL du fichier <span style={{ color: '#FF6B6B' }}>*</span></label>
            <div style={{ ...ms.inputBox, borderColor: fileUrl ? sc.color : '#E2DFF2', boxShadow: fileUrl ? `0 0 0 4px ${sc.color}12` : 'none' }}>
              <span style={ms.ico}>🔗</span>
              <input style={ms.input} value={fileUrl} onChange={e => { setFileUrl(e.target.value); setError('') }}
                placeholder="https://drive.google.com/…" onKeyDown={e => e.key === 'Enter' && handleSave()} />
            </div>
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.73rem', color: '#B0AACB', marginTop: 4 }}>Google Drive, Dropbox, PDF en ligne…</p>
          </div>

          {/* Preview */}
          {title && fileUrl && (
            <div style={{ ...ms.preview, borderColor: `${sc.color}28`, background: `${sc.color}06` }}>
              <span style={{ fontSize: 18 }}>📎</span>
              <div>
                <p style={{ fontFamily: "'Baloo 2',cursive", fontSize: '0.86rem', fontWeight: 700, color: sc.color }}>{title}</p>
                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: '0.70rem', color: '#9E99B8' }}>{fileUrl.slice(0, 48)}{fileUrl.length > 48 ? '…' : ''}</p>
              </div>
            </div>
          )}

          {error && <p style={ms.error}>⚠️ {error}</p>}
          {done  && <p style={ms.success}>✓ Fichier ajouté !</p>}
        </div>

        {/* Actions */}
        <div style={ms.actions}>
          <button style={ms.cancelBtn} onClick={onClose} disabled={saving}>Annuler</button>
          <button
            style={{ ...ms.saveBtn, background: done ? 'linear-gradient(135deg,#4ECDC4,#44B8B0)' : `linear-gradient(135deg,${sc.color},${sc.color}CC)`, boxShadow: `0 4px 14px ${sc.color}30`, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1 }}
            onClick={handleSave} disabled={saving || done}
          >
            {saving ? <><span style={ms.spin} /> Ajout…</> : done ? '✓ Ajouté !' : '+ Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

const ms = {
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(26,24,48,0.50)', backdropFilter: 'blur(6px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal:     { background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderRadius: 24, width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(100,90,150,0.22)', animation: 'fadeInUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both' },
  header:    { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px 24px 0', gap: 12 },
  pill:      { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 12px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 800, marginBottom: 6 },
  title:     { fontFamily: "'Baloo 2',cursive", fontSize: '1.30rem', fontWeight: 800, color: '#1A1830', letterSpacing: '-0.02em' },
  sub:       { fontFamily: "'Nunito',sans-serif", fontSize: '0.80rem', color: '#9E99B8', marginTop: 2 },
  closeBtn:  { width: 32, height: 32, borderRadius: 10, border: '1.5px solid rgba(200,196,220,0.30)', background: 'rgba(248,247,255,0.8)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#9E99B8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  form:      { padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14 },
  field:     { display: 'flex', flexDirection: 'column', gap: 6 },
  label:     { fontFamily: "'Nunito',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#4A4666' },
  inputBox:  { position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.9)', border: '2px solid', borderRadius: 13, transition: 'all 200ms ease' },
  ico:       { position: 'absolute', left: 12, fontSize: 15, pointerEvents: 'none' },
  input:     { width: '100%', height: 46, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Nunito',sans-serif", fontSize: '0.91rem', fontWeight: 600, color: '#1A1830', paddingLeft: 40, paddingRight: 14 },
  preview:   { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 12, border: '1.5px solid' },
  error:     { fontFamily: "'Nunito',sans-serif", fontSize: '0.79rem', fontWeight: 700, color: '#FF6B6B' },
  success:   { fontFamily: "'Nunito',sans-serif", fontSize: '0.82rem', fontWeight: 700, color: '#4ECDC4' },
  actions:   { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px 22px', borderTop: '1.5px solid rgba(200,196,220,0.15)' },
  cancelBtn: { padding: '10px 20px', borderRadius: 9999, border: '1.5px solid rgba(200,196,220,0.35)', background: 'rgba(248,247,255,0.8)', fontFamily: "'Nunito',sans-serif", fontSize: '0.84rem', fontWeight: 700, color: '#9E99B8', cursor: 'pointer' },
  saveBtn:   { padding: '10px 22px', borderRadius: 9999, border: 'none', fontFamily: "'Nunito',sans-serif", fontSize: '0.84rem', fontWeight: 800, color: '#fff', transition: 'all 250ms ease', display: 'flex', alignItems: 'center', gap: 7 },
  spin:      { display: 'block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.65s linear infinite', flexShrink: 0 },
}