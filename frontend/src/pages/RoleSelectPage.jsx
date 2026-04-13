// src/pages/RoleSelectPage.jsx
// Page d'accueil — sélection du rôle : Teacher / Parent / Child

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/shared/AppShell'
import Logo from '../components/shared/Logo'

const roles = [
  {
    id:          'teacher',
    emoji:       '👩‍🏫',
    label:       'Teacher',
    description: 'Manage your class, start sessions and monitor student engagement in real time.',
    color:       '#9B8EFF',
    colorLight:  '#F3F0FF',
    colorBorder: '#C5B9FF',
    gradient:    'linear-gradient(135deg, #9B8EFF 0%, #C5B9FF 100%)',
    shadow:      'rgba(155,142,255,0.30)',
    path:        '/teacher/login',
    badge:       'Live Dashboard',
    badgeColor:  '#9B8EFF',
  },
  {
    id:          'parent',
    emoji:       '👨‍👩‍👧',
    label:       'Parent',
    description: "Follow your child's daily progress and receive personalized insights every evening.",
    color:       '#FF6B6B',
    colorLight:  '#FFF0F0',
    colorBorder: '#FFB3B3',
    gradient:    'linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)',
    shadow:      'rgba(255,107,107,0.28)',
    path:        '/parent/login',
    badge:       'Daily Summary',
    badgeColor:  '#FF6B6B',
  },
  {
    id:          'child',
    emoji:       '🧒',
    label:       'Student',
    description: 'Join your class session and let your teacher know how you feel about the lesson.',
    color:       '#4ECDC4',
    colorLight:  '#F0FFFE',
    colorBorder: '#A8E6E2',
    gradient:    'linear-gradient(135deg, #4ECDC4 0%, #74C0FC 100%)',
    shadow:      'rgba(78,205,196,0.28)',
    path:        '/student/login',
    badge:       'Fun & Interactive',
    badgeColor:  '#4ECDC4',
  },
]

const RoleSelectPage = () => {
  const navigate = useNavigate()
  const [hoveredRole, setHoveredRole] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)

  const handleSelect = (role) => {
    setSelectedRole(role.id)
    setTimeout(() => navigate(role.path), 320)
  }

  return (
    <AppShell>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <Logo size="lg" showTagline />
      </div>

      {/* ── Hero Text ──────────────────────────────────────────────────── */}
      <div style={styles.heroSection}>
        <div style={styles.heroBadge}>
          <span style={styles.heroBadgeDot} />
          Smart Classroom Engagement
        </div>

        <h1 style={styles.heroTitle}>
          Who are you
          <span style={styles.heroTitleAccent}> today?</span>
        </h1>

        <p style={styles.heroSub}>
          Choose your role to access your personalized EduKids experience.
        </p>
      </div>

      {/* ── Role Cards ─────────────────────────────────────────────────── */}
      <div style={styles.cardsGrid}>
        {roles.map((role, i) => (
          <RoleCard
            key={role.id}
            role={role}
            index={i}
            isHovered={hoveredRole === role.id}
            isSelected={selectedRole === role.id}
            onHover={() => setHoveredRole(role.id)}
            onLeave={() => setHoveredRole(null)}
            onClick={() => handleSelect(role)}
          />
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          🔒 Secure · Private · Built for schools
        </p>
      </div>
    </AppShell>
  )
}

// ── RoleCard ──────────────────────────────────────────────────────────────────
const RoleCard = ({ role, index, isHovered, isSelected, onHover, onLeave, onClick }) => {
  return (
    <div
      style={{
        ...styles.card,
        animationDelay:  `${index * 120}ms`,
        transform:       isSelected
          ? 'scale(0.97)'
          : isHovered
            ? 'translateY(-10px) scale(1.02)'
            : 'translateY(0) scale(1)',
        boxShadow:       isHovered
          ? `0 20px 56px ${role.shadow}, 0 4px 16px rgba(100,90,150,0.08)`
          : '0 4px 24px rgba(100,90,150,0.09)',
        border:          isHovered
          ? `2px solid ${role.colorBorder}`
          : '2px solid rgba(255,255,255,0.9)',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {/* Gradient strip top */}
      <div style={{
        ...styles.cardStrip,
        background: role.gradient,
        opacity:    isHovered ? 1 : 0.7,
      }} />

      {/* Badge */}
      <div style={{
        ...styles.badge,
        background: `${role.colorLight}`,
        color:      role.color,
        border:     `1.5px solid ${role.colorBorder}`,
      }}>
        {role.badge}
      </div>

      {/* Emoji */}
      <div style={{
        ...styles.emojiWrap,
        background:  `${role.colorLight}`,
        boxShadow:   isHovered ? `0 8px 24px ${role.shadow}` : `0 4px 12px ${role.shadow}`,
        transform:   isHovered ? 'scale(1.12) rotate(-4deg)' : 'scale(1) rotate(0deg)',
      }}>
        <span style={styles.emoji}>{role.emoji}</span>
      </div>

      {/* Content */}
      <h2 style={{
        ...styles.cardTitle,
        color: isHovered ? role.color : '#2D2A45',
      }}>
        {role.label}
      </h2>

      <p style={styles.cardDesc}>{role.description}</p>

      {/* CTA */}
      <div style={{
        ...styles.cta,
        background: isHovered ? role.gradient : 'rgba(255,255,255,0.5)',
        color:      isHovered ? '#fff' : role.color,
        border:     isHovered ? 'none' : `2px solid ${role.colorBorder}`,
        boxShadow:  isHovered ? `0 4px 16px ${role.shadow}` : 'none',
      }}>
        {isHovered ? `Enter as ${role.label} →` : `I'm a ${role.label}`}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  header: {
    display:        'flex',
    justifyContent: 'center',
    marginBottom:   48,
    animation:      'fadeInUp 0.5s ease both',
  },

  heroSection: {
    textAlign:      'center',
    marginBottom:   56,
    animation:      'fadeInUp 0.5s 0.1s ease both',
  },

  heroBadge: {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            8,
    background:     'rgba(155,142,255,0.10)',
    border:         '1.5px solid rgba(155,142,255,0.25)',
    borderRadius:   9999,
    padding:        '6px 16px',
    fontSize:       '0.80rem',
    fontWeight:     700,
    color:          '#9B8EFF',
    letterSpacing:  '0.04em',
    textTransform:  'uppercase',
    marginBottom:   20,
  },

  heroBadgeDot: {
    width:        7,
    height:       7,
    borderRadius: '50%',
    background:   '#9B8EFF',
    display:      'inline-block',
    boxShadow:    '0 0 8px rgba(155,142,255,0.8)',
    animation:    'pulse-soft 2s ease-in-out infinite',
  },

  heroTitle: {
    fontFamily:    "'Baloo 2', cursive",
    fontSize:      'clamp(2.4rem, 5vw, 3.6rem)',
    fontWeight:    800,
    color:         '#1A1830',
    marginBottom:  16,
    letterSpacing: '-0.02em',
    lineHeight:    1.1,
  },

  heroTitleAccent: {
    background:           'linear-gradient(135deg, #FF6B6B 0%, #9B8EFF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
  },

  heroSub: {
    fontSize:   'clamp(1rem, 2vw, 1.15rem)',
    fontWeight: 500,
    color:      '#706C8A',
    maxWidth:   520,
    margin:     '0 auto',
    lineHeight: 1.6,
  },

  cardsGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap:                 28,
    maxWidth:            960,
    margin:              '0 auto',
    animation:           'fadeInUp 0.5s 0.2s ease both',
  },

  card: {
    background:     'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(16px)',
    borderRadius:   24,
    padding:        '32px 28px 28px',
    cursor:         'pointer',
    position:       'relative',
    overflow:       'hidden',
    transition:     'all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    animation:      'fadeInUp 0.5s ease both',
    userSelect:     'none',
  },

  cardStrip: {
    position:     'absolute',
    top:          0,
    left:         0,
    right:        0,
    height:       5,
    borderRadius: '24px 24px 0 0',
    transition:   'opacity 300ms ease',
  },

  badge: {
    display:       'inline-flex',
    alignItems:    'center',
    borderRadius:  9999,
    padding:       '4px 12px',
    fontSize:      '0.74rem',
    fontWeight:    800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom:  20,
  },

  emojiWrap: {
    width:          72,
    height:         72,
    borderRadius:   20,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   20,
    transition:     'all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  emoji: {
    fontSize: 36,
    lineHeight: 1,
  },

  cardTitle: {
    fontFamily:    "'Baloo 2', cursive",
    fontSize:      '1.55rem',
    fontWeight:    800,
    marginBottom:  10,
    transition:    'color 250ms ease',
    letterSpacing: '-0.01em',
  },

  cardDesc: {
    fontSize:     '0.92rem',
    fontWeight:   500,
    color:        '#706C8A',
    lineHeight:   1.6,
    marginBottom: 28,
  },

  cta: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '12px 24px',
    borderRadius:   9999,
    fontSize:       '0.88rem',
    fontWeight:     700,
    transition:     'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  footer: {
    textAlign:  'center',
    marginTop:  56,
    animation:  'fadeInUp 0.5s 0.4s ease both',
  },

  footerText: {
    fontSize:   '0.82rem',
    fontWeight: 600,
    color:      '#C8C4DC',
    letterSpacing: '0.02em',
  },
}

export default RoleSelectPage