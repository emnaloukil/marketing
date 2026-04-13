// src/components/auth/AuthCard.jsx
// Card glassmorphism pour les formulaires d'authentification

const AuthCard = ({ children, style: extra = {} }) => {
  return (
    <div style={{ ...styles.card, ...extra }}>
      {children}
    </div>
  )
}

const styles = {
  card: {
    width:          '100%',
    background:     'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(20px)',
    borderRadius:   28,
    border:         '1.5px solid rgba(255,255,255,0.92)',
    boxShadow:      '0 8px 48px rgba(100,90,150,0.11), 0 2px 12px rgba(100,90,150,0.06)',
    padding:        '40px 36px',
    animation:      'fadeInUp 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
  },
}

export default AuthCard