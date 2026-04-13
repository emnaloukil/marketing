// src/components/shared/AppShell.jsx
// Layout wrapper principal — utilisé sur toutes les pages

import AppBackground from './AppBackground'

const AppShell = ({ children, maxWidth = 1150, centered = false }) => {
  return (
    <div style={styles.page}>
      <AppBackground />
      <div style={{
        ...styles.container,
        maxWidth,
        ...(centered && styles.centered),
      }}>
        {children}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight:  '100vh',
    position:   'relative',
    overflow:   'hidden',
    background: 'linear-gradient(180deg, #FFF9F4 0%, #FFFDFB 50%, #F8F7FF 100%)',
    padding:    '28px 16px 40px',
  },
  container: {
    position: 'relative',
    zIndex:   2,
    margin:   '0 auto',
  },
  centered: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      'calc(100vh - 68px)',
  },
}

export default AppShell