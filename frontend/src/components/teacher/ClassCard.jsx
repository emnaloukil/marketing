import { useState } from 'react'

const iconMap = {
  numbers: '🔢',
  book: '📘',
  science: '🧪',
  globe: '🌍',
  music: '🎵',
  sport: '⚽',
  computer: '💻',
  history: '🏛️',
  nature: '🌱',
}

const CARD_COLOR = '#9B8EFF'

const ClassCard = ({ cls, onClick, onDelete }) => {
  const [hov, setHov] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const classId = cls._id || cls.id
  const displayIcon = iconMap[cls.icon] || '📘'

  return (
    <div
      style={{
        ...styles.card,
        boxShadow: hov
          ? '0 16px 48px rgba(155,142,255,0.18), 0 4px 16px rgba(100,90,150,0.08)'
          : '0 4px 20px rgba(100,90,150,0.08)',
        transform: hov ? 'translateY(-6px)' : 'translateY(0)',
        border: hov
          ? '2px solid rgba(155,142,255,0.25)'
          : '2px solid rgba(255,255,255,0.9)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false)
        setMenuOpen(false)
      }}
    >
      <div
        style={{
          ...styles.strip,
          background: 'linear-gradient(90deg, #9B8EFF 0%, #74C0FC 100%)',
          opacity: hov ? 1 : 0.75,
        }}
      />

      <div style={styles.cardTop}>
        <div
          style={{
            ...styles.iconWrap,
            background: 'rgba(155,142,255,0.12)',
            boxShadow: hov ? '0 4px 14px rgba(155,142,255,0.18)' : 'none',
            transform: hov ? 'scale(1.08) rotate(-3deg)' : 'scale(1)',
          }}
          onClick={() => onClick(cls)}
        >
          <span style={{ fontSize: 28 }}>{displayIcon}</span>
        </div>

        <div style={styles.menuWrap}>
          <button
            style={styles.menuBtn}
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((m) => !m)
            }}
            title="Options"
          >
            ···
          </button>

          {menuOpen && (
            <div style={styles.menuDropdown}>
              <button
                style={styles.menuItem}
                onClick={(e) => {
                  e.stopPropagation()
                  onClick(cls)
                }}
              >
                ✏️ Open class
              </button>

              <button
                style={{ ...styles.menuItem, color: '#FF6B6B' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(classId)
                }}
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.cardBody} onClick={() => onClick(cls)}>
        <div>
          <h3
            style={{
              ...styles.className,
              color: hov ? CARD_COLOR : '#1A1830',
            }}
          >
            {cls.name}
          </h3>

          <p style={styles.teacherName}>
            Teacher: {cls.teacherName || 'Unknown'}
          </p>

          <p style={styles.classCode}>
            Code: {cls.classCode}
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(255,255,255,0.90)',
    backdropFilter: 'blur(16px)',
    borderRadius: 22,
    padding: '0 0 18px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 350ms cubic-bezier(0.34,1.56,0.64,1)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 220,
  },
  strip: {
    height: 5,
    width: '100%',
    transition: 'opacity 300ms ease',
    flexShrink: 0,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '18px 18px 0',
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 350ms cubic-bezier(0.34,1.56,0.64,1)',
    cursor: 'pointer',
  },
  menuWrap: {
    position: 'relative',
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 20,
    color: '#C8C4DC',
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: 8,
    lineHeight: 0.8,
    letterSpacing: 2,
  },
  menuDropdown: {
    position: 'absolute',
    right: 0,
    top: 32,
    background: 'rgba(255,255,255,0.98)',
    border: '1.5px solid rgba(200,196,220,0.25)',
    borderRadius: 14,
    boxShadow: '0 8px 28px rgba(100,90,150,0.14)',
    overflow: 'hidden',
    zIndex: 10,
    minWidth: 160,
  },
  menuItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontFamily: "'Nunito', sans-serif",
    fontSize: '0.84rem',
    fontWeight: 700,
    color: '#4A4666',
    cursor: 'pointer',
  },
  cardBody: {
    padding: '24px 18px 0',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  className: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.7rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    margin: 0,
    transition: 'color 250ms ease',
  },
  teacherName: {
    margin: '6px 0 0',
    fontSize: '0.86rem',
    fontWeight: 700,
    color: '#7C7698',
  },
  classCode: {
    margin: '6px 0 0',
    fontSize: '0.82rem',
    fontWeight: 800,
    color: '#9B8EFF',
  },
}

export default ClassCard