import { useState } from 'react'

const INITIAL = {
  firstName: '', lastName: '', dateOfBirth: '', supportProfile: 'none'
}

const inputStyle = {
  width: '100%', background: '#f5f3ff',
  border: '1.5px solid #e4deff', borderRadius: 12,
  padding: '10px 13px', fontSize: 13, color: '#1e1b4b',
  outline: 'none', boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block', fontSize: 11, color: '#9d91c7',
  fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.07em', marginBottom: 5,
}

export default function AddChildModal({ onClose, onAdd }) {
  const [form,    setForm]    = useState(INITIAL)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.firstName)   errs.firstName   = 'Required'
    if (!form.lastName)    errs.lastName    = 'Required'
    if (!form.dateOfBirth) {
      errs.dateOfBirth = 'Required'
    } else {
      const age = (Date.now() - new Date(form.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365.25)
      if (age < 3 || age > 18) errs.dateOfBirth = 'Age must be between 3 and 18'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    try {
      setLoading(true)
      await onAdd(form)
      onClose()
    } catch (err) {
      setErrors({
        general: err.response?.status === 409
          ? 'Child already registered'
          : 'Something went wrong, please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(79,30,158,0.15)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 50, padding: '1rem',
    }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 390, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#5b21b6', padding: '1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0 }}>Add a child</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, margin: '2px 0 0' }}>
              Register your child's information
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 28, height: 28, color: '#fff', fontSize: 18, cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.4rem' }}>

          {/* Auto-generated banner */}
          <div style={{ display: 'flex', gap: 9, background: '#f5f3ff', border: '1.5px solid #e4deff', borderRadius: 12, padding: '11px 13px', marginBottom: 16 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#7c3aed" strokeWidth="1.4"/>
              <path d="M9 8v5M9 6v.5" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <div>
              <p style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 2px' }}>Student ID</p>
              <p style={{ fontSize: 12, color: '#7c3aed', fontWeight: 500, margin: 0 }}>
                Generated automatically by the server after registration.
              </p>
            </div>
          </div>

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>First name</label>
              <input style={inputStyle} placeholder="Sophie" value={form.firstName} onChange={set('firstName')} />
              {errors.firstName && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{errors.firstName}</p>}
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input style={inputStyle} placeholder="Martin" value={form.lastName} onChange={set('lastName')} />
              {errors.lastName && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{errors.lastName}</p>}
            </div>
          </div>

          {/* Date of birth */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Date of birth</label>
            <input type="date" style={inputStyle} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
            {errors.dateOfBirth && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{errors.dateOfBirth}</p>}
          </div>

          {/* Support profile */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Support profile</label>
            <select style={inputStyle} value={form.supportProfile} onChange={set('supportProfile')}>
              <option value="none">None</option>
              <option value="adhd">ADHD</option>
              <option value="autism">Autism</option>
              <option value="dyslexia">Dyslexia</option>
            </select>
          </div>

          {errors.general && (
            <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{errors.general}</p>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ background: '#f5f3ff', border: '1.5px solid #e4deff', borderRadius: 12, padding: '10px 18px', fontSize: 13, cursor: 'pointer', color: '#9d91c7', fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ background: '#5b21b6', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Adding...' : 'Add child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}