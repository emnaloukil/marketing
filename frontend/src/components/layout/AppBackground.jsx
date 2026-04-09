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
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(65px)',
    opacity: 0.38,
    zIndex: 0
  },
  blob1: {
    width: 220,
    height: 220,
    top: 40,
    left: -50,
    background: 'rgba(255, 196, 196, 0.7)'
  },
  blob2: {
    width: 240,
    height: 240,
    top: 90,
    right: -70,
    background: 'rgba(197, 181, 255, 0.65)'
  },
  blob3: {
    width: 200,
    height: 200,
    bottom: 30,
    left: '20%',
    background: 'rgba(255, 223, 168, 0.55)'
  },
  blob4: {
    width: 170,
    height: 170,
    bottom: 100,
    right: '18%',
    background: 'rgba(181, 241, 229, 0.55)'
  },
  floatIcon: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.22,
    pointerEvents: 'none',
    userSelect: 'none'
  },
  icon1: { top: 70, left: '11%', fontSize: 18 },
  icon2: { top: 120, right: '14%', fontSize: 18 },
  icon3: { top: 320, right: '8%', fontSize: 20 },
  icon4: { top: 210, left: '8%', fontSize: 18 },
  icon5: { bottom: 220, right: '26%', fontSize: 16 },
  icon6: { bottom: 110, left: '8%', fontSize: 18 }
}

export default AppBackground