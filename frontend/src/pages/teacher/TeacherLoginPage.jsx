// src/pages/teacher/TeacherLoginPage.jsx
// Page de connexion enseignant — connectée au backend

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
    errors.email = "L'email est requis"
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Format d'email invalide"
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
  } else if (form.password.length < 6) {
    errors.password = 'Au moins 6 caractères'
  }

  return errors
}

// ── Page principale ───────────────────────────────────────────────────────────
const TeacherLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      const res = await authAPI.teacherLogin({
        email: form.email,
        password: form.password,
      })

      setSuccess(true)
      login(res.user, res.token, 'teacher')

      setTimeout(() => {
        navigate('/teacher/dashboard')
      }, 1000)
    } catch (err) {
      setApiError(err.message || 'Email ou mot de passe incorrect')
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
          <h1 style={styles.title}>Bon retour !</h1>
          <p style={styles.subtitle}>
            Connectez-vous pour accéder à votre tableau de bord enseignant.
          </p>
        </div>

        <div style={styles.testHint}>
          <span style={{ fontSize: 15 }}>💡</span>
          <p style={styles.testHintText}>
            Entrez vos identifiants enseignant pour vous connecter.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.form}>
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

            <div style={styles.passwordWrap}>
              <InputField
                label="Mot de passe"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon="🔒"
                error={errors.password}
                required
                accentColor="#9B8EFF"
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
                  <p style={styles.successTitle}>Connexion réussie !</p>
                  <p style={styles.successSub}>
                    Redirection vers votre dashboard…
                  </p>
                </div>
              </div>
            )}

            <SubmitButton
              label="Se connecter"
              loadingLabel="Connexion en cours…"
              successLabel="Connecté ! 🎉"
              loading={loading}
              success={success}
              color="#9B8EFF"
              gradient="linear-gradient(135deg, #9B8EFF 0%, #74C0FC 100%)"
              type="submit"
            />
          </div>
        </form>


        <div style={styles.registerLink}>
          <span style={styles.registerText}>Pas encore de compte ?</span>
          <Link to="/teacher/register" style={styles.link}>
            Créer un compte →
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

  testHint: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'rgba(155,142,255,0.07)',
    border: '1.5px dashed rgba(155,142,255,0.25)',
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

  forgotBtn: {
    alignSelf: 'flex-end',
    background: 'none',
    border: 'none',
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.80rem',
    fontWeight: 700,
    color: '#9B8EFF',
    cursor: 'pointer',
    padding: '2px 0',
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
  },

  forgotToast: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    background: 'rgba(155,142,255,0.08)',
    border: '1.5px solid rgba(155,142,255,0.22)',
    borderRadius: 12,
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#706C8A',
    animation: 'fadeInUp 0.3s ease both',
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

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '24px 0 16px',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: 'rgba(200,196,220,0.30)',
  },
  dividerText: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#C8C4DC',
  },

  ssoBtn: {
    width: '100%',
    height: 48,
    background: 'rgba(248,247,255,0.7)',
    border: '1.5px solid rgba(200,196,220,0.35)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#B0AACB',
    cursor: 'not-allowed',
    marginBottom: 8,
  },
  ssoBadge: {
    fontSize: '0.68rem',
    fontWeight: 800,
    background: 'rgba(155,142,255,0.12)',
    color: '#9B8EFF',
    padding: '2px 8px',
    borderRadius: 9999,
    border: '1px solid rgba(155,142,255,0.20)',
    marginLeft: 4,
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
    color: '#9B8EFF',
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

export default TeacherLoginPage