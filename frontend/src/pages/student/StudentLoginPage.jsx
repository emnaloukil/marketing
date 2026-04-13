// src/pages/student/StudentLoginPage.jsx
// Student login page — English display

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

  if (!form.studentCode.trim()) {
    errors.studentCode = 'Student code is required'
  }

  if (!form.pin.trim()) {
    errors.pin = 'PIN is required'
  } else if (!/^\d{4,8}$/.test(form.pin)) {
    errors.pin = 'PIN must contain 4 to 8 digits'
  }

  return errors
}

const StudentLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    studentCode: '',
    pin: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    setSuccess(false)

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      const res = await authAPI.studentLogin({
        studentCode: form.studentCode,
        pin: form.pin,
      })

      setSuccess(true)
      login(res.user,'student')

      setTimeout(() => {
        navigate('/student/dashboard')
      }, 1000)
    } catch (err) {
      setApiError(err.message || 'Incorrect student code or PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout role="student">
      <AuthCard>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <span style={{ fontSize: 36 }}>🧒</span>
          </div>
          <h1 style={styles.title}>Hi there 👋</h1>
          <p style={styles.subtitle}>
            Enter your student code and PIN to join your session.
          </p>
        </div>

        <div style={styles.testHint}>
          <span style={{ fontSize: 15 }}>✨</span>
          <p style={styles.testHintText}>
            Ask your teacher for your student code and PIN.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.form}>
            <InputField
              label="Student Code"
              name="studentCode"
              type="text"
              value={form.studentCode}
              onChange={handleChange}
              placeholder="Ex: STU-2045"
              icon="🪪"
              error={errors.studentCode}
              required
              accentColor="#4ECDC4"
              autoComplete="off"
            />

            <InputField
              label="PIN"
              name="pin"
              type="password"
              value={form.pin}
              onChange={handleChange}
              placeholder="••••"
              icon="🔢"
              error={errors.pin}
              required
              accentColor="#4ECDC4"
              autoComplete="off"
            />

            {apiError && (
              <div style={styles.apiError}>
                <span>⚠️</span>
                {apiError}
              </div>
            )}

            {success && (
              <div style={styles.successMsg}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <div>
                  <p style={styles.successTitle}>Login successful!</p>
                  <p style={styles.successSub}>
                    Redirecting to your space…
                  </p>
                </div>
              </div>
            )}

            <SubmitButton
              label="Enter"
              loadingLabel="Signing in..."
              successLabel="Let’s go! 🎉"
              loading={loading}
              success={success}
              color="#4ECDC4"
              gradient="linear-gradient(135deg, #4ECDC4 0%, #74C0FC 100%)"
              type="submit"
            />
          </div>
        </form>

        <div style={styles.registerLink}>
          <span style={styles.registerText}>Wrong role?</span>
          <Link to="/role-select" style={styles.link}>
            Choose another access →
          </Link>
        </div>
      </AuthCard>

      <div style={styles.backLink}>
        <Link to="/" style={styles.backAnchor}>
          ← Back to home
        </Link>
        <span style={styles.separator}>·</span>
        <Link to="/role-select" style={styles.backAnchor}>
          Change role
        </Link>
      </div>
    </AuthLayout>
  )
}

const styles = {
  cardHeader: {
    textAlign: 'center',
    marginBottom: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: '#F0FFFE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 4px 16px rgba(78,205,196,0.20)',
  },
  title: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#1A1830',
    marginBottom: 8,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.90rem',
    fontWeight: 500,
    color: '#9E99B8',
    lineHeight: 1.5,
  },
  testHint: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'rgba(78,205,196,0.07)',
    border: '1.5px dashed rgba(78,205,196,0.25)',
    borderRadius: 12,
    marginBottom: 24,
  },
  testHintText: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.80rem',
    fontWeight: 500,
    color: '#9E99B8',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  apiError: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'rgba(255,107,107,0.08)',
    border: '1.5px solid rgba(255,107,107,0.22)',
    borderRadius: 12,
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.84rem',
    fontWeight: 700,
    color: '#FF6B6B',
    animation: 'fadeInUp 0.2s ease both',
  },
  successMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 18px',
    background: 'rgba(78,205,196,0.08)',
    border: '1.5px solid rgba(78,205,196,0.25)',
    borderRadius: 14,
    animation: 'fadeInUp 0.3s ease both',
  },
  successTitle: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#4ECDC4',
    marginBottom: 2,
  },
  successSub: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.80rem',
    fontWeight: 500,
    color: '#9E99B8',
  },
  registerLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingTop: 18,
    borderTop: '1.5px solid rgba(200,196,220,0.20)',
  },
  registerText: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.86rem',
    fontWeight: 500,
    color: '#9E99B8',
  },
  link: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.86rem',
    fontWeight: 800,
    color: '#4ECDC4',
    textDecoration: 'none',
  },
  backLink: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  backAnchor: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.80rem',
    fontWeight: 600,
    color: '#B0AACB',
    textDecoration: 'none',
  },
  separator: {
    color: '#E2DFF2',
  },
}

export default StudentLoginPage