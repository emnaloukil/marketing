// src/components/dashboard/SessionCard.jsx
// SessionCard + PlanningCard + AlertCard — réunis dans ce fichier

import { useState } from 'react'

const subjectConfig = {
  mathematics: { color: '#9B8EFF', emoji: '🔢', label: 'Maths'    },
  reading:     { color: '#FF6B6B', emoji: '📖', label: 'Français' },
  sciences:    { color: '#4ECDC4', emoji: '🔬', label: 'Sciences' },
}

const trendConfig = {
  improving:   { color: '#4ECDC4', label: '↑ Amélioration',   bg: 'rgba(78,205,196,0.10)'  },
  stable_good: { color: '#9B8EFF', label: '→ Stable (bien)',   bg: 'rgba(155,142,255,0.10)' },
  stable_bad:  { color: '#FFB347', label: '→ Stable (à risque)', bg: 'rgba(255,179,71,0.10)'  },
  degrading:   { color: '#FF6B6B', label: '↓ Dégradation',    bg: 'rgba(255,107,107,0.10)' },
  recovering:  { color: '#FFB347', label: '↗ Récupération',   bg: 'rgba(255,179,71,0.10)'  },
}

// ── SessionCard ───────────────────────────────────────────────────────────────
export const SessionCard = ({ session, isActive = false }) => {
  const [hov, setHov] = useState(false)
  const sc = subjectConfig[session.subject] || subjectConfig.mathematics
  const tc = trendConfig[session.trend]    || trendConfig.stable_good

  return (
    <div
      style={{
        ...styles.sessionCard,
        border: isActive
          ? `2px solid rgba(78,205,196,0.35)`
          : hov
            ? `2px solid ${sc.color}30`
            : '2px solid rgba(255,255,255,0.88)',
        boxShadow: isActive
          ? '0 6px 28px rgba(78,205,196,0.14)'
          : hov
            ? `0 8px 28px ${sc.color}18`
            : '0 2px 14px rgba(100,90,150,0.07)',
        transform: hov && !isActive ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top */}
      <div style={styles.sessionTop}>
        <div style={{
          ...styles.sessionIcon,
          background: `${sc.color}14`,
        }}>
          <span style={{ fontSize: 20 }}>{sc.emoji}</span>
        </div>

        <div style={styles.sessionMeta}>
          <p style={styles.sessionTitle}>{session.title}</p>
          <p style={styles.sessionSub}>
            {session.date || 'Aujourd\'hui'} · {session.duration}
          </p>
        </div>

        {isActive && (
          <div style={styles.liveBadge}>
            <span style={styles.liveDot} />
            LIVE
          </div>
        )}
      </div>

      {/* Score bar */}
      <div style={styles.scoreWrap}>
        <div style={styles.scoreBarOuter}>
          <div style={{
            ...styles.scoreBarInner,
            width:      `${session.classScore}%`,
            background: `linear-gradient(90deg, ${sc.color}80, ${sc.color})`,
          }} />
        </div>
        <span style={{ ...styles.scoreLabel, color: sc.color }}>
          {session.classScore}/100
        </span>
      </div>

      {/* Trend */}
      <div style={{
        ...styles.trendPill,
        color:      tc.color,
        background: tc.bg,
      }}>
        {tc.label}
      </div>
    </div>
  )
}

// ── PlanningCard ──────────────────────────────────────────────────────────────
export const PlanningCard = ({ item }) => {
  const [hov, setHov] = useState(false)

  return (
    <div
      style={{
        ...styles.planCard,
        borderLeft:   `3px solid ${item.color}`,
        background:   hov ? `${item.color}08` : 'rgba(248,247,255,0.6)',
        transform:    hov ? 'translateX(3px)' : 'none',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
      <div style={styles.planContent}>
        <p style={styles.planSubject}>{item.subject}</p>
        <p style={styles.planTopic}>{item.topic}</p>
      </div>
      <span style={{ ...styles.planTime, color: item.color }}>{item.time}</span>
    </div>
  )
}

// ── AlertCard ─────────────────────────────────────────────────────────────────
export const AlertCard = ({ alert }) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div style={{
      ...styles.alertCard,
      borderLeft:  `3px solid ${alert.color}`,
      background:  `${alert.color}08`,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{alert.emoji}</span>
      <div style={styles.alertContent}>
        <p style={{ ...styles.alertStudent, color: alert.color }}>{alert.student}</p>
        <p style={styles.alertMsg}>{alert.message}</p>
      </div>
      <button
        style={styles.dismissBtn}
        onClick={() => setDismissed(true)}
        title="Ignorer"
      >
        ✕
      </button>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  // SessionCard
  sessionCard: {
    background:     'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(12px)',
    borderRadius:   16,
    padding:        '16px',
    transition:     'all 280ms cubic-bezier(0.34,1.56,0.64,1)',
    cursor:         'pointer',
  },
  sessionTop: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
    marginBottom: 12,
  },
  sessionIcon: {
    width:          40,
    height:         40,
    borderRadius:   12,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  sessionMeta: {
    flex:     1,
    overflow: 'hidden',
  },
  sessionTitle: {
    fontFamily:  "'Baloo 2', cursive",
    fontSize:    '0.88rem',
    fontWeight:  700,
    color:       '#1A1830',
    whiteSpace:  'nowrap',
    overflow:    'hidden',
    textOverflow:'ellipsis',
  },
  sessionSub: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.74rem',
    fontWeight: 500,
    color:      '#9E99B8',
  },
  liveBadge: {
    display:      'flex',
    alignItems:   'center',
    gap:          5,
    background:   'rgba(78,205,196,0.12)',
    border:       '1px solid rgba(78,205,196,0.25)',
    borderRadius: 9999,
    padding:      '3px 9px',
    fontSize:     '0.68rem',
    fontWeight:   800,
    color:        '#4ECDC4',
    flexShrink:   0,
  },
  liveDot: {
    width:        6,
    height:       6,
    borderRadius: '50%',
    background:   '#4ECDC4',
    animation:    'pulse-soft 1.8s ease-in-out infinite',
    display:      'inline-block',
  },
  scoreWrap: {
    display:      'flex',
    alignItems:   'center',
    gap:          8,
    marginBottom: 10,
  },
  scoreBarOuter: {
    flex:         1,
    height:       5,
    background:   '#F0EEF8',
    borderRadius: 9999,
    overflow:     'hidden',
  },
  scoreBarInner: {
    height:       '100%',
    borderRadius: 9999,
    transition:   'width 600ms ease',
  },
  scoreLabel: {
    fontFamily: "'Baloo 2', cursive",
    fontSize:   '0.82rem',
    fontWeight: 800,
    minWidth:   44,
    textAlign:  'right',
  },
  trendPill: {
    display:      'inline-flex',
    fontSize:     '0.72rem',
    fontWeight:   800,
    padding:      '3px 10px',
    borderRadius: 9999,
  },

  // PlanningCard
  planCard: {
    display:      'flex',
    alignItems:   'center',
    gap:          12,
    padding:      '12px 14px',
    borderRadius: 12,
    transition:   'all 200ms ease',
    cursor:       'pointer',
  },
  planContent: {
    flex: 1,
  },
  planSubject: {
    fontFamily: "'Baloo 2', cursive",
    fontSize:   '0.86rem',
    fontWeight: 700,
    color:      '#1A1830',
  },
  planTopic: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.74rem',
    fontWeight: 500,
    color:      '#9E99B8',
  },
  planTime: {
    fontFamily: "'Baloo 2', cursive",
    fontSize:   '0.84rem',
    fontWeight: 800,
    flexShrink: 0,
  },

  // AlertCard
  alertCard: {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          10,
    padding:      '12px 14px',
    borderRadius: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertStudent: {
    fontFamily:   "'Baloo 2', cursive",
    fontSize:     '0.84rem',
    fontWeight:   700,
    marginBottom: 2,
  },
  alertMsg: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.78rem',
    fontWeight: 500,
    color:      '#706C8A',
    lineHeight: 1.5,
  },
  dismissBtn: {
    background: 'none',
    border:     'none',
    cursor:     'pointer',
    color:      '#C8C4DC',
    fontSize:   12,
    padding:    '2px 4px',
    fontWeight: 700,
    flexShrink: 0,
    lineHeight: 1,
  },
}