// src/components/dashboard/StatCard.jsx

import { useState } from 'react'

const StatCard = ({ stat, index }) => {
  const [hov, setHov] = useState(false)

  return (
    <div
      style={{
        ...styles.card,
        boxShadow: hov
          ? `0 10px 32px ${stat.color}22`
          : '0 2px 14px rgba(100,90,150,0.07)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        animationDelay: `${index * 80}ms`,
        borderColor: hov ? `${stat.color}30` : 'rgba(255,255,255,0.85)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Icon */}
      <div style={{
        ...styles.iconWrap,
        background: `${stat.color}14`,
        boxShadow:  hov ? `0 4px 14px ${stat.color}28` : 'none',
      }}>
        <span style={{ fontSize: 22 }}>{stat.icon}</span>
      </div>

      {/* Value */}
      <div style={styles.valueRow}>
        <span style={{ ...styles.value, color: stat.color }}>{stat.value}</span>
        {stat.trend && (
          <span style={{
            ...styles.trend,
            color:      stat.trend === 'up' ? '#4ECDC4' : '#FF6B6B',
            background: stat.trend === 'up' ? 'rgba(78,205,196,0.10)' : 'rgba(255,107,107,0.10)',
          }}>
            {stat.trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>

      <p style={styles.label}>{stat.label}</p>
      <p style={styles.sub}>{stat.sub}</p>

      {/* Bottom accent */}
      <div style={{
        ...styles.accent,
        background: stat.color,
        opacity:    hov ? 1 : 0,
        width:      hov ? '50%' : '0%',
      }} />
    </div>
  )
}

const styles = {
  card: {
    background:     'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(12px)',
    borderRadius:   20,
    padding:        '22px 20px 18px',
    border:         '2px solid',
    position:       'relative',
    overflow:       'hidden',
    transition:     'all 300ms cubic-bezier(0.34,1.56,0.64,1)',
    animation:      'fadeInUp 0.5s ease both',
    cursor:         'default',
  },
  iconWrap: {
    width:          48,
    height:         48,
    borderRadius:   14,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   14,
    transition:     'all 250ms ease',
  },
  valueRow: {
    display:     'flex',
    alignItems:  'center',
    gap:         8,
    marginBottom: 4,
  },
  value: {
    fontFamily:    "'Baloo 2', cursive",
    fontSize:      '2rem',
    fontWeight:    800,
    letterSpacing: '-0.02em',
    lineHeight:    1,
  },
  trend: {
    fontSize:     '0.75rem',
    fontWeight:   800,
    padding:      '2px 7px',
    borderRadius: 9999,
  },
  label: {
    fontFamily:   "'Baloo 2', cursive",
    fontSize:     '0.90rem',
    fontWeight:   700,
    color:        '#1A1830',
    marginBottom: 3,
  },
  sub: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.75rem',
    fontWeight: 500,
    color:      '#9E99B8',
  },
  accent: {
    position:     'absolute',
    bottom:       0,
    left:         0,
    height:       3,
    borderRadius: '0 4px 0 0',
    transition:   'all 400ms ease',
  },
}

export default StatCard