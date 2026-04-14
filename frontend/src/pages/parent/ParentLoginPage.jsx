// src/pages/parent/ParentLoginPage.jsx
// Parent login page — English display

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import AuthLayout from '../../components/auth/AuthLayout'
import AuthCard from '../../components/auth/AuthCard'
import InputField from '../../components/auth/InputField'
import SubmitButton from '../../components/auth/SubmitButton'

import { authAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

// ── Validation ────────────────────────────────────────────────────────────────
const validate = (form) => {
  const errors = {}

  if (!form.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Invalid email format'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.password = 'At least 6 characters'
  }

  return errors
}

// ── Main page ────────────────────────────────────────────────────────────────
const ParentLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
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
      const res = await authAPI.parentLogin({
        email: form.email,
        password: form.password,
      })

      setSuccess(true)
      login(res.user, 'parent')

      setTimeout(() => {
        navigate('/parent/dashboard')
      }, 1000)
    } catch (err) {
      setApiError(err.message || 'Incorrect email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout role="parent">
      <AuthCard>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <span style={{ fontSize: 36 }}>👨‍👩‍👧</span>
          </div>
          <h1 style={styles.title}>Welcome back!</h1>
          <p style={styles.subtitle}>
            Sign in to follow your child’s progress.
          </p>
        </div>

        <div style={styles.testHint}>
          <span style={{ fontSize: 15 }}>💡</span>
          <p style={styles.testHintText}>
            Enter your parent account credentials to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.form}>
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon="📧"
              error={errors.email}
              required
              accentColor="#FF6B6B"
              autoComplete="email"
            />

            <div style={styles.passwordWrap}>
              <InputField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon="🔒"
                error={errors.password}
                required
                accentColor="#FF6B6B"
                autoComplete="current-password"
              />
            </div>

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
                    Redirecting to your dashboard…
                  </p>
                </div>
              </div>
            )}

            <SubmitButton
              label="Sign In"
              loadingLabel="Signing in..."
              successLabel="Signed in! 🎉"
              loading={loading}
              success={success}
              color="#FF6B6B"
              gradient="linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)"
              type="submit"
            />
          </div>
        </form>

        <div style={styles.registerLink}>
          <span style={styles.registerText}>Don’t have an account yet?</span>
          <Link to="/parent/register" style={styles.link}>
            Create an account →
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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  cardHeader: {
    textAlign: 'center',
    marginBottom: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: '#FFF0F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 4px 16px rgba(255,107,107,0.20)',
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
    background: 'rgba(255,107,107,0.07)',
    border: '1.5px dashed rgba(255,107,107,0.25)',
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

  passwordWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
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
    color: '#FF6B6B',
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

export default ParentLoginPage