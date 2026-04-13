// src/pages/teacher/TeacherRegisterPage.jsx
// Page d'inscription enseignant — formulaire complet avec validation

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

  if (!form.firstName.trim()) errors.firstName = 'Le prénom est requis'
  if (!form.lastName.trim()) errors.lastName = 'Le nom est requis'

  if (!form.email.trim()) {
    errors.email = "L'email est requis"
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Format d'email invalide"
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
  } else if (form.password.length < 6) {
    errors.password = 'Au moins 6 caractères'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirmez votre mot de passe'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
  }

  

  return errors
}

// ── Page principale ───────────────────────────────────────────────────────────
const TeacherRegisterPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  // ── Handlers ─────────────────────────────────────────────────────────────
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
      const res = await authAPI.teacherRegister({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      })

      setSuccess(true)

      login(res.user, res.token, 'teacher')

      setTimeout(() => {
        navigate('/teacher/dashboard')
      }, 1200)
    } catch (err) {
      setApiError(err.message || 'Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthLayout role="teacher">
      <AuthCard>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <span style={{ fontSize: 36 }}>👩‍🏫</span>
          </div>
          <h1 style={styles.title}>Créer votre compte</h1>
          <p style={styles.subtitle}>
            Rejoignez EduKids et pilotez votre classe en temps réel.
          </p>
        </div>


        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.form}>
            <FormSection label="👤 Votre identité">
              <div style={styles.row}>
                <InputField
                  label="Prénom"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Sophie"
                  icon="✏️"
                  error={errors.firstName}
                  required
                  accentColor="#9B8EFF"
                  autoComplete="given-name"
                />
                <InputField
                  label="Nom"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Marchand"
                  icon="✏️"
                  error={errors.lastName}
                  required
                  accentColor="#9B8EFF"
                  autoComplete="family-name"
                />
              </div>
            </FormSection>

            <FormSection label="🔐 Informations de connexion">
              <InputField
                label="Adresse email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="sophie.marchand@ecole.fr"
                icon="📧"
                error={errors.email}
                required
                accentColor="#9B8EFF"
                autoComplete="email"
              />
              <div style={styles.row}>
                <InputField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon="🔒"
                  error={errors.password}
                  hint="6 caractères minimum"
                  required
                  accentColor="#9B8EFF"
                  autoComplete="new-password"
                />
                <InputField
                  label="Confirmer"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon="🔒"
                  error={errors.confirmPassword}
                  required
                  accentColor="#9B8EFF"
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
                  <p style={styles.successTitle}>Compte créé avec succès !</p>
                  <p style={styles.successSub}>Redirection vers le dashboard…</p>
                </div>
              </div>
            )}

            <SubmitButton
              label="Créer mon compte enseignant"
              loadingLabel="Création en cours…"
              successLabel="Compte créé ! 🎉"
              loading={loading}
              success={success}
              color="#9B8EFF"
              gradient="linear-gradient(135deg, #9B8EFF 0%, #74C0FC 100%)"
              type="submit"
            />
          </div>
        </form>

        <div style={styles.loginLink}>
          <span style={styles.loginLinkText}>Vous avez déjà un compte ?</span>
          <Link to="/teacher/login" style={styles.link}>
            Se connecter →
          </Link>
        </div>
      </AuthCard>

      <div style={styles.backLink}>
        <Link to="/" style={styles.backAnchor}>
          ← Retour à l'accueil
        </Link>
        <span style={styles.separator}>·</span>
        <Link to="/role-select" style={styles.backAnchor}>
          Changer de rôle
        </Link>
      </div>
    </AuthLayout>
  )
}

// ── Composants internes ───────────────────────────────────────────────────────

const FormSection = ({ label, children }) => (
  <div style={styles.section}>
    <p style={styles.sectionLabel}>{label}</p>
    <div style={styles.sectionFields}>{children}</div>
  </div>
)

const ProgressSteps = ({ form }) => {
  const steps = [
    { label: 'Identité', filled: !!(form.firstName && form.lastName) },
    {
      label: 'Connexion',
      filled: !!(form.email && form.password && form.confirmPassword),
    },
  ]

  const filledCount = steps.filter((s) => s.filled).length
  const pct = Math.round((filledCount / steps.length) * 100)

  return (
    <div style={styles.progress}>
      <div style={styles.progressHeader}>
        <span style={styles.progressLabel}>Complétion du profil</span>
        <span style={styles.progressPct}>{pct}%</span>
      </div>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  cardHeader: {
    textAlign: 'center',
    marginBottom: 28,
  },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: '#F3F0FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 4px 16px rgba(155,142,255,0.20)',
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

  progress: {
    marginBottom: 28,
    padding: '16px 18px',
    background: 'rgba(243,240,255,0.50)',
    borderRadius: 16,
    border: '1.5px solid rgba(155,142,255,0.15)',
  },

  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressLabel: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#9B8EFF',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  },

  progressPct: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '0.90rem',
    fontWeight: 800,
    color: '#9B8EFF',
  },

  progressBar: {
    height: 5,
    background: '#E8E5F8',
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 12,
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #9B8EFF 0%, #74C0FC 100%)',
    borderRadius: 9999,
    transition: 'width 400ms cubic-bezier(0.34,1.56,0.64,1)',
  },


  progressDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    transition: 'all 300ms ease',
    flexShrink: 0,
  },

  progressStepLabel: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.74rem',
    transition: 'all 250ms ease',
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
    color: '#9B8EFF',
    letterSpacing: '0.01em',
    paddingBottom: 4,
    borderBottom: '1.5px solid rgba(155,142,255,0.15)',
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
    color: '#9B8EFF',
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

export default TeacherRegisterPage