// src/components/shared/Card.jsx
// Carte réutilisable avec hover et variants

import { useState } from 'react'

const Card = ({
  children,
  onClick,
  hoverable   = false,
  padding     = '24px',
  radius      = 20,
  shadow      = 'md',
  background  = 'rgba(255,255,255,0.85)',
  border,
  style: extraStyle = {},
}) => {
  const [hovered, setHovered] = useState(false)

  const shadowMap = {
    none: 'none',
    sm:   '0 2px 8px rgba(100,90,150,0.08)',
    md:   '0 4px 20px rgba(100,90,150,0.10)',
    lg:   '0 8px 32px rgba(100,90,150,0.13)',
    xl:   '0 16px 48px rgba(100,90,150,0.16)',
  }

  const cardStyle = {
    background,
    backdropFilter: 'blur(12px)',
    borderRadius:   radius,
    padding,
    border:         border || '1.5px solid rgba(255,255,255,0.8)',
    boxShadow:      hovered && hoverable
      ? '0 12px 40px rgba(100,90,150,0.15)'
      : shadowMap[shadow] || shadowMap.md,
    transform:      hovered && hoverable ? 'translateY(-4px)' : 'translateY(0)',
    transition:     'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor:         onClick ? 'pointer' : 'default',
    position:       'relative',
    overflow:       'hidden',
    ...extraStyle,
  }

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}

export default Card