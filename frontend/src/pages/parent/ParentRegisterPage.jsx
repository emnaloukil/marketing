// src/pages/parent/ParentRegisterPage.jsx
// Parent registration page — English display

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

  if (!form.firstName.trim()) errors.firstName = 'First name is required'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required'

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^[+\d\s()-]{8,20}$/.test(form.phone)) {
    errors.phone = 'Invalid phone number'
  }

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

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

const ParentRegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      const res = await authAPI.parentRegister({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        password: form.password,
      })

      setSuccess(true)
      login(res.user, 'parent')

      setTimeout(() => {
        navigate('/parent/dashboard')
      }, 1200)
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
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
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>
            Join EduKids and follow your child’s progress with confidence.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.form}>
            <FormSection label="👤 Personal information">
              <div style={styles.row}>
                <InputField
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Amina"
                  icon="✏️"
                  error={errors.firstName}
                  required
                  accentColor="#FF6B6B"
                  autoComplete="given-name"
                />
                <InputField
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Ben Salem"
                  icon="✏️"
                  error={errors.lastName}
                  required
                  accentColor="#FF6B6B"
                  autoComplete="family-name"
                />
              </div>

              <InputField
                label="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+216 12 345 678"
                icon="📱"
                error={errors.phone}
                required
                accentColor="#FF6B6B"
                autoComplete="tel"
              />
            </FormSection>

            <FormSection label="🔐 Login details">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="parent@email.com"
                icon="📧"
                error={errors.email}
                required
                accentColor="#FF6B6B"
                autoComplete="email"
              />

              <div style={styles.row}>
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon="🔒"
                  error={errors.password}
                  hint="Minimum 6 characters"
                  required
                  accentColor="#FF6B6B"
                  autoComplete="new-password"
                />
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon="🔒"
                  error={errors.confirmPassword}
                  required
                  accentColor="#FF6B6B"
                  autoComplete="new-password"
                />
              </div>
            </FormSection>

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
                  <p style={styles.successTitle}>Account created successfully!</p>
                  <p style={styles.successSub}>Redirecting to your dashboard…</p>
                </div>
              </div>
            )}

            <SubmitButton
              label="Create parent account"
              loadingLabel="Creating account..."
              successLabel="Account created! 🎉"
              loading={loading}
              success={success}
              color="#FF6B6B"
              gradient="linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)"
              type="submit"
            />
          </div>
        </form>

        <div style={styles.loginLink}>
          <span style={styles.loginLinkText}>Already have an account?</span>
          <Link to="/parent/login" style={styles.link}>
            Sign in →
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

const FormSection = ({ label, children }) => (
  <div style={styles.section}>
    <p style={styles.sectionLabel}>{label}</p>
    <div style={styles.sectionFields}>{children}</div>
  </div>
)

const styles = {
  cardHeader: {
    textAlign: 'center',
    marginBottom: 28,
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  sectionLabel: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#FF6B6B',
    letterSpacing: '0.01em',
    paddingBottom: 4,
    borderBottom: '1.5px solid rgba(255,107,107,0.15)',
  },
  sectionFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
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
  loginLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingTop: 20,
    borderTop: '1.5px solid rgba(200,196,220,0.20)',
  },
  loginLinkText: {
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
    transition: 'opacity 200ms ease',
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
    transition: 'color 200ms ease',
  },
  separator: {
    color: '#E2DFF2',
  },
}

export default ParentRegisterPage