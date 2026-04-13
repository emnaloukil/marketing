// src/components/dashboard/DashboardHeader.jsx

import { useState } from 'react'

const DashboardHeader = ({ teacher, activeSession, sidebarWidth }) => {
  const [hov, setHov] = useState(false)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const now = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <header style={{ ...styles.header, left: sidebarWidth, right: 0 }}>
      <div style={styles.inner}>

        {/* Left — greeting */}
        <div style={styles.left}>
          <h1 style={styles.greeting}>
            {greeting}, <span style={styles.name}>{teacher.firstName}</span> 👋
          </h1>
          <p style={styles.date}>{now} · {teacher.className} · {teacher.school}</p>
        </div>

        {/* Right — session pill + notif */}
        <div style={styles.right}>

          {/* Session active pill */}
          {activeSession && (
            <div style={styles.sessionPill}>
              <span style={styles.liveDot} />
              <span style={styles.sessionPillText}>
                Session live · {activeSession.title}
              </span>
              <span style={styles.sessionScore}>
                {activeSession.classScore}/100
              </span>
            </div>
          )}

          {/* Notif bell */}
          <button
            style={{
              ...styles.iconBtn,
              background: hov ? 'rgba(155,142,255,0.10)' : 'rgba(248,247,255,0.8)',
            }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
          >
            <span style={{ fontSize: 18 }}>🔔</span>
            <span style={styles.notifDot} />
          </button>

        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    position:       'fixed',
    top:            0,
    zIndex:         40,
    background:     'rgba(255,249,244,0.90)',
    backdropFilter: 'blur(16px)',
    borderBottom:   '1.5px solid rgba(200,196,220,0.20)',
    boxShadow:      '0 2px 12px rgba(100,90,150,0.05)',
    transition:     'left 300ms cubic-bezier(0.34,1.56,0.64,1)',
  },
  inner: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '0 28px',
    height:         68,
    gap:            16,
    flexWrap:       'wrap',
  },
  left: {
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
  },
  greeting: {
    fontFamily:    "'Baloo 2', cursive",
    fontSize:      '1.18rem',
    fontWeight:    800,
    color:         '#1A1830',
    letterSpacing: '-0.01em',
    lineHeight:    1.2,
  },
  name: {
    background:           'linear-gradient(135deg, #9B8EFF 0%, #74C0FC 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor:  'transparent',
    backgroundClip:       'text',
  },
  date: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.78rem',
    fontWeight: 500,
    color:      '#9E99B8',
    textTransform: 'capitalize',
  },
  right: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
  },
  sessionPill: {
    display:     'flex',
    alignItems:  'center',
    gap:         8,
    background:  'rgba(78,205,196,0.10)',
    border:      '1.5px solid rgba(78,205,196,0.25)',
    borderRadius: 9999,
    padding:     '6px 14px 6px 10px',
  },
  liveDot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
    background:   '#4ECDC4',
    boxShadow:    '0 0 8px rgba(78,205,196,0.8)',
    animation:    'pulse-soft 1.8s ease-in-out infinite',
    flexShrink:   0,
  },
  sessionPillText: {
    fontFamily:  "'Nunito', sans-serif",
    fontSize:    '0.78rem',
    fontWeight:  700,
    color:       '#3BB8B0',
    maxWidth:    200,
    overflow:    'hidden',
    textOverflow:'ellipsis',
    whiteSpace:  'nowrap',
  },
  sessionScore: {
    fontFamily:  "'Baloo 2', cursive",
    fontSize:    '0.82rem',
    fontWeight:  800,
    color:       '#4ECDC4',
    background:  'rgba(78,205,196,0.15)',
    padding:     '2px 8px',
    borderRadius: 9999,
  },
  iconBtn: {
    width:        40,
    height:       40,
    borderRadius: 12,
    border:       '1.5px solid rgba(200,196,220,0.25)',
    cursor:       'pointer',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    transition:   'all 200ms ease',
    position:     'relative',
  },
  notifDot: {
    position:     'absolute',
    top:          8,
    right:        8,
    width:        7,
    height:       7,
    borderRadius: '50%',
    background:   '#FF6B6B',
    border:       '1.5px solid white',
  },
}

export default DashboardHeader