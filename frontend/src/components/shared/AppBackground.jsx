// src/components/shared/AppBackground.jsx
// Blobs flous + icônes flottantes — fond de toutes les pages

const AppBackground = () => {
  return (
    <>
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <div style={{ ...styles.blob, ...styles.blob3 }} />
      <div style={{ ...styles.blob, ...styles.blob4 }} />
      <div style={{ ...styles.floatIcon, ...styles.icon1 }}>⭐</div>
      <div style={{ ...styles.floatIcon, ...styles.icon2 }}>☁️</div>
      <div style={{ ...styles.floatIcon, ...styles.icon3 }}>🌈</div>
      <div style={{ ...styles.floatIcon, ...styles.icon4 }}>🧠</div>
      <div style={{ ...styles.floatIcon, ...styles.icon5 }}>✨</div>
      <div style={{ ...styles.floatIcon, ...styles.icon6 }}>📚</div>
    </>
  )
}

const styles = {
  blob: {
    position:     'absolute',
    borderRadius: '50%',
    filter:       'blur(65px)',
    opacity:      0.38,
    zIndex:       0,
    animation:    'pulse-soft 8s ease-in-out infinite',
  },
  blob1: {
    width:      220,
    height:     220,
    top:        40,
    left:       -50,
    background: 'rgba(255, 196, 196, 0.7)',
    animationDelay: '0s',
  },
  blob2: {
    width:      240,
    height:     240,
    top:        90,
    right:      -70,
    background: 'rgba(197, 181, 255, 0.65)',
    animationDelay: '2s',
  },
  blob3: {
    width:      200,
    height:     200,
    bottom:     30,
    left:       '20%',
    background: 'rgba(255, 223, 168, 0.55)',
    animationDelay: '4s',
  },
  blob4: {
    width:      170,
    height:     170,
    bottom:     100,
    right:      '18%',
    background: 'rgba(181, 241, 229, 0.55)',
    animationDelay: '6s',
  },
  floatIcon: {
    position:       'absolute',
    zIndex:         1,
    opacity:        0.22,
    pointerEvents:  'none',
    userSelect:     'none',
    animation:      'float 6s ease-in-out infinite',
  },
  icon1: { top: 70,         left: '11%',  fontSize: 18, animationDelay: '0s'   },
  icon2: { top: 120,        right: '14%', fontSize: 18, animationDelay: '1s'   },
  icon3: { top: 320,        right: '8%',  fontSize: 20, animationDelay: '2s'   },
  icon4: { top: 210,        left: '8%',   fontSize: 18, animationDelay: '0.5s' },
  icon5: { bottom: 220,     right: '26%', fontSize: 16, animationDelay: '3s'   },
  icon6: { bottom: 110,     left: '8%',   fontSize: 18, animationDelay: '1.5s' },
}

export default AppBackground