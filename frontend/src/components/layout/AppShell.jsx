import AppBackground from './AppBackground'

const AppShell = ({ children }) => {
  return (
    <div style={styles.page}>
      <AppBackground />
      <div style={styles.container}>
        {children}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #FFF9F4 0%, #FFFDFB 50%, #F8F7FF 100%)',
    padding: '28px 16px 40px'
  },
  container: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 1150,
    margin: '0 auto'
  }
}

export default AppShell