// src/components/auth/SubmitButton.jsx
// Bouton de soumission avec états loading / success / error

import { useState } from 'react'

const SubmitButton = ({
  label       = 'Créer un compte',
  loadingLabel = 'En cours...',
  successLabel = 'Succès !',
  loading     = false,
  success     = false,
  disabled    = false,
  color       = '#9B8EFF',
  gradient    = 'linear-gradient(135deg, #9B8EFF 0%, #74C0FC 100%)',
  onClick,
  type        = 'submit',
  fullWidth   = true,
}) => {
  const [hov, setHov] = useState(false)

  const isDisabled = disabled || loading || success

  const getBackground = () => {
    if (success) return 'linear-gradient(135deg, #4ECDC4 0%, #44B8B0 100%)'
    if (loading) return gradient
    if (isDisabled) return '#E2DFF2'
    return hov
      ? gradient.replace('0%', '20%')
      : gradient
  }

  const getLabel = () => {
    if (success) return successLabel
    if (loading) return loadingLabel
    return label
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => !isDisabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:          fullWidth ? '100%' : 'auto',
        height:         52,
        padding:        '0 32px',
        borderRadius:   9999,
        border:         'none',
        background:     isDisabled && !loading && !success ? '#E2DFF2' : getBackground(),
        color:          isDisabled && !loading && !success ? '#9E99B8' : '#fff',
        fontFamily:     "'Nunito', sans-serif",
        fontSize:       '1rem',
        fontWeight:     800,
        cursor:         isDisabled ? 'not-allowed' : 'pointer',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            10,
        boxShadow:      isDisabled ? 'none' : hov
          ? `0 10px 32px ${color}45, 0 4px 12px ${color}25`
          : `0 4px 18px ${color}35`,
        transform:      hov && !isDisabled ? 'translateY(-2px) scale(1.02)' : 'scale(1)',
        transition:     'all 280ms cubic-bezier(0.34,1.56,0.64,1)',
        letterSpacing:  '0.01em',
      }}
    >
      {/* Spinner loading */}
      {loading && (
        <span style={styles.spinner} />
      )}

      {/* Success icon */}
      {success && (
        <span style={{ fontSize: 18 }}>✓</span>
      )}

      {getLabel()}
    </button>
  )
}

const styles = {
  spinner: {
    display:      'block',
    width:        18,
    height:       18,
    border:       '2.5px solid rgba(255,255,255,0.35)',
    borderTop:    '2.5px solid #ffffff',
    borderRadius: '50%',
    animation:    'spin 0.65s linear infinite',
    flexShrink:   0,
  },
}

export default SubmitButton