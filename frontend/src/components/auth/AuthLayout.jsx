// src/components/auth/AuthLayout.jsx
// Layout wrapper pour toutes les pages d'authentification

import AppBackground from '../shared/AppBackground'
import Logo from '../shared/Logo'
import { useNavigate } from 'react-router-dom'

const AuthLayout = ({ children, role = 'teacher' }) => {
  const navigate = useNavigate()

  const roleConfig = {
    teacher: {
      color:      '#9B8EFF',
      colorLight: '#F3F0FF',
      colorBorder:'#C5B9FF',
      gradient:   'linear-gradient(135deg, #9B8EFF 0%, #74C0FC 100%)',
      label:      'Espace Enseignant',
      emoji:      '👩‍🏫',
      bg:         'linear-gradient(160deg, #FBF9FF 0%, #FFFDFB 50%, #F3F0FF 100%)',
    },
    parent: {
      color:      '#FF6B6B',
      colorLight: '#FFF0F0',
      colorBorder:'#FFB3B3',
      gradient:   'linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)',
      label:      'Espace Parent',
      emoji:      '👨‍👩‍👧',
      bg:         'linear-gradient(160deg, #FFF9F4 0%, #FFFDFB 50%, #FFF0F0 100%)',
    },
    student: {
      color:      '#4ECDC4',
      colorLight: '#F0FFFE',
      colorBorder:'#A8E6E2',
      gradient:   'linear-gradient(135deg, #4ECDC4 0%, #74C0FC 100%)',
      label:      'Espace Élève',
      emoji:      '🧒',
      bg:         'linear-gradient(160deg, #F0FFFE 0%, #FFFDFB 50%, #EFF8FF 100%)',
    },
  }

  const cfg = roleConfig[role] || roleConfig.teacher

  return (
    <div style={{ ...styles.page, background: cfg.bg }}>
      {/* Blobs de fond */}
      <AppBackground />

      {/* Contenu centré */}
      <div style={styles.wrapper}>

        {/* Header */}
        <div style={styles.header}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Logo size="md" />
          </div>

          {/* Role pill */}
          <div style={{
            ...styles.rolePill,
            background: cfg.colorLight,
            color:      cfg.color,
            border:     `1.5px solid ${cfg.colorBorder}`,
          }}>
            <span>{cfg.emoji}</span>
            {cfg.label}
          </div>
        </div>

        {/* Page content */}
        {children}

        {/* Footer minimal */}
        <p style={styles.footerNote}>
          🔒 Vos données sont sécurisées et ne sont jamais revendues.
        </p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight:  '100vh',
    position:   'relative',
    overflow:   'hidden',
    padding:    '0 16px 40px',
  },
  wrapper: {
    position:       'relative',
    zIndex:         2,
    maxWidth:       520,
    margin:         '0 auto',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    paddingTop:     40,
  },
  header: {
    width:          '100%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   40,
    flexWrap:       'wrap',
    gap:            12,
  },
  rolePill: {
    display:       'flex',
    alignItems:    'center',
    gap:           6,
    padding:       '6px 16px',
    borderRadius:  9999,
    fontSize:      '0.80rem',
    fontWeight:    700,
    letterSpacing: '0.02em',
  },
  footerNote: {
    marginTop:  28,
    fontSize:   '0.78rem',
    fontWeight: 500,
    color:      '#C8C4DC',
    textAlign:  'center',
  },
}

export default AuthLayout