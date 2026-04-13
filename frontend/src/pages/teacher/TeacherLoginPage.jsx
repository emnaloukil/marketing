// src/pages/teacher/TeacherLoginPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import AuthLayout from '../../components/auth/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import InputField from '../../components/auth/InputField'
import SubmitButton from '../../components/auth/SubmitButton'

import { authAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

const validate = (form) => {
  const errors = {}
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Invalid email format'
  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 6) errors.password = 'At least 6 characters'
  return errors
}

const TeacherLoginPage = () => {
  const navigate    = useNavigate()
  const { login }   = useAuth()

  const [form,     setForm]     = useState({ email: '', password: '' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSuccess(false)

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setLoading(true)
    try {
      // AuthContext.login() normalise automatiquement toutes les structures backend
      const res = await authAPI.teacherLogin({ email: form.email, password: form.password })

      // ✅ On passe la réponse complète — AuthContext extrait le bon objet
      login(res, 'teacher')

      setSuccess(true)
      setTimeout(() => navigate('/teacher/classes'), 1000)
    } catch (err) {
      setApiError(err.message || 'Incorrect email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout role="teacher">
      <AuthCard>
        <div style={s.cardHeader}>
          <div style={s.iconWrap}><span style={{ fontSize: 36 }}>👩‍🏫</span></div>
          <h1 style={s.title}>Welcome back!</h1>
          <p style={s.subtitle}>Sign in to access your teacher dashboard.</p>
        </div>

        <div style={s.hint}>
          <span style={{ fontSize: 15 }}>💡</span>
          <p style={s.hintText}>Enter your teacher account credentials to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={s.form}>
            <InputField
              label="Email Address" name="email" type="email"
              value={form.email} onChange={handleChange}
              icon="📧" error={errors.email} required accentColor="#9B8EFF" autoComplete="email"
            />
            <InputField
              label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="••••••••" icon="🔒" error={errors.password}
              required accentColor="#9B8EFF" autoComplete="current-password"
            />

            {apiError && <div style={s.apiError}><span>⚠️</span>{apiError}</div>}
            {success && (
              <div style={s.successMsg}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <div>
                  <p style={s.successTitle}>Login successful!</p>
                  <p style={s.successSub}>Redirecting to your dashboard…</p>
                </div>
              </div>
            )}

            <SubmitButton
              label="Sign In" loadingLabel="Signing in..." successLabel="Signed in! 🎉"
              loading={loading} success={success} color="#9B8EFF"
              gradient="linear-gradient(135deg, #9B8EFF 0%, #74C0FC 100%)" type="submit"
            />
          </div>
        </form>

        <div style={s.registerLink}>
          <span style={s.registerText}>Don't have an account yet?</span>
          <Link to="/teacher/register" style={s.link}>Create an account →</Link>
        </div>
      </AuthCard>

      <div style={s.backLink}>
        <Link to="/" style={s.backAnchor}>← Back to home</Link>
        <span style={s.sep}>·</span>
        <Link to="/role-select" style={s.backAnchor}>Change role</Link>
      </div>
    </AuthLayout>
  )
}

const s = {
  cardHeader: { textAlign: 'center', marginBottom: 24 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20, background: '#F3F0FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(155,142,255,0.20)',
  },
  title: { fontFamily: "'Baloo 2',cursive", fontSize: '1.75rem', fontWeight: 800, color: '#1A1830', marginBottom: 8, letterSpacing: '-0.02em' },
  subtitle: { fontFamily: "'Nunito',sans-serif", fontSize: '0.90rem', fontWeight: 500, color: '#9E99B8', lineHeight: 1.5 },
  hint: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    background: 'rgba(155,142,255,0.07)', border: '1.5px dashed rgba(155,142,255,0.25)',
    borderRadius: 12, marginBottom: 24,
  },
  hintText: { fontFamily: "'Nunito',sans-serif", fontSize: '0.80rem', fontWeight: 500, color: '#9E99B8' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  apiError: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
    background: 'rgba(255,107,107,0.08)', border: '1.5px solid rgba(255,107,107,0.22)',
    borderRadius: 12, fontFamily: "'Nunito',sans-serif", fontSize: '0.84rem', fontWeight: 700, color: '#FF6B6B',
  },
  successMsg: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
    background: 'rgba(78,205,196,0.08)', border: '1.5px solid rgba(78,205,196,0.25)', borderRadius: 14,
  },
  successTitle: { fontFamily: "'Baloo 2',cursive", fontSize: '0.95rem', fontWeight: 700, color: '#4ECDC4', marginBottom: 2 },
  successSub: { fontFamily: "'Nunito',sans-serif", fontSize: '0.80rem', fontWeight: 500, color: '#9E99B8' },
  registerLink: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, paddingTop: 18, borderTop: '1.5px solid rgba(200,196,220,0.20)',
  },
  registerText: { fontFamily: "'Nunito',sans-serif", fontSize: '0.86rem', fontWeight: 500, color: '#9E99B8' },
  link: { fontFamily: "'Nunito',sans-serif", fontSize: '0.86rem', fontWeight: 800, color: '#9B8EFF', textDecoration: 'none' },
  backLink: { display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 },
  backAnchor: { fontFamily: "'Nunito',sans-serif", fontSize: '0.80rem', fontWeight: 600, color: '#B0AACB', textDecoration: 'none' },
  sep: { color: '#E2DFF2' },
}

export default TeacherLoginPage