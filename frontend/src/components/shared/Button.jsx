// src/components/shared/Button.jsx
// Bouton réutilisable avec variants et états

import { useState } from 'react'

const Button = ({
  children,
  onClick,
  variant   = 'primary',
  size      = 'md',
  color     = 'coral',
  disabled  = false,
  loading   = false,
  fullWidth = false,
  icon,
  style: extraStyle = {},
  type = 'button',
}) => {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const colorMap = {
    coral:    { bg: '#FF6B6B', light: '#FFF0F0', text: '#fff', border: '#FF5252' },
    lavender: { bg: '#9B8EFF', light: '#F3F0FF', text: '#fff', border: '#8678F0' },
    mint:     { bg: '#4ECDC4', light: '#F0FFFE', text: '#fff', border: '#3BB8B0' },
    amber:    { bg: '#FFB347', light: '#FFFAF0', text: '#fff', border: '#F0A030' },
    sky:      { bg: '#74C0FC', light: '#EFF8FF', text: '#fff', border: '#5AADEE' },
    rose:     { bg: '#F06595', light: '#FFF0F5', text: '#fff', border: '#E04E80' },
    gray:     { bg: '#706C8A', light: '#F0EEF8', text: '#fff', border: '#5C5878' },
  }

  const sizeMap = {
    sm: { padding: '8px 18px',  fontSize: '0.85rem', height: 36 },
    md: { padding: '12px 28px', fontSize: '0.95rem', height: 46 },
    lg: { padding: '16px 36px', fontSize: '1.05rem', height: 54 },
    xl: { padding: '18px 44px', fontSize: '1.15rem', height: 62 },
  }

  const c = colorMap[color] || colorMap.coral
  const s = sizeMap[size]   || sizeMap.md

  const getStyle = () => {
    const base = {
      display:        'inline-flex',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            8,
      border:         'none',
      borderRadius:   9999,
      fontFamily:     "'Nunito', sans-serif",
      fontWeight:     700,
      cursor:         disabled || loading ? 'not-allowed' : 'pointer',
      transition:     'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      whiteSpace:     'nowrap',
      userSelect:     'none',
      width:          fullWidth ? '100%' : 'auto',
      ...s,
      ...extraStyle,
    }

    if (disabled || loading) {
      return { ...base, background: '#E2DFF2', color: '#9E99B8', opacity: 0.7 }
    }

    switch (variant) {
      case 'primary':
        return {
          ...base,
          background:  hovered
            ? `linear-gradient(135deg, ${c.border} 0%, ${c.bg} 100%)`
            : `linear-gradient(135deg, ${c.bg} 0%, ${c.border} 100%)`,
          color:       c.text,
          boxShadow:   hovered
            ? `0 8px 24px ${c.bg}55, 0 2px 8px ${c.bg}30`
            : `0 4px 14px ${c.bg}40`,
          transform:   pressed ? 'scale(0.97)' : hovered ? 'scale(1.03) translateY(-1px)' : 'scale(1)',
        }

      case 'secondary':
        return {
          ...base,
          background: hovered ? c.light : 'rgba(255,255,255,0.8)',
          color:      c.bg,
          boxShadow:  hovered ? `0 4px 16px ${c.bg}25` : '0 2px 8px rgba(100,90,150,0.08)',
          border:     `2px solid ${hovered ? c.bg : c.border}33`,
          transform:  pressed ? 'scale(0.97)' : hovered ? 'scale(1.02) translateY(-1px)' : 'scale(1)',
        }

      case 'ghost':
        return {
          ...base,
          background: hovered ? c.light : 'transparent',
          color:      hovered ? c.bg : '#706C8A',
          transform:  pressed ? 'scale(0.97)' : 'scale(1)',
        }

      default:
        return base
    }
  }

  return (
    <button
      type={type}
      style={getStyle()}
      onClick={!disabled && !loading ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled || loading}
    >
      {loading ? (
        <span style={styles.spinner} />
      ) : (
        <>
          {icon && <span style={{ fontSize: s.fontSize }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}

const styles = {
  spinner: {
    display:      'block',
    width:        18,
    height:       18,
    border:       '2px solid rgba(255,255,255,0.4)',
    borderTop:    '2px solid white',
    borderRadius: '50%',
    animation:    'spin 0.7s linear infinite',
  },
}

export default Button