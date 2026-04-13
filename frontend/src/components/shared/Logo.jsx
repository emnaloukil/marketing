// src/components/shared/Logo.jsx

const Logo = ({ size = 'md', showTagline = false }) => {
  const sizeMap = {
    sm: { logo: '1.4rem', tag: '0.70rem', gap: 6, icon: 28 },
    md: { logo: '1.9rem', tag: '0.80rem', gap: 8, icon: 36 },
    lg: { logo: '2.6rem', tag: '0.90rem', gap: 10, icon: 48 },
    xl: { logo: '3.2rem', tag: '1.0rem',  gap: 12, icon: 58 },
  }
  const s = sizeMap[size] || sizeMap.md

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      {/* Icon */}
      <div style={{
        width:          s.icon,
        height:         s.icon,
        background:     'linear-gradient(135deg, #FF6B6B 0%, #FFB347 50%, #FF6B6B 100%)',
        borderRadius:   '30%',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       s.icon * 0.5,
        boxShadow:      '0 4px 14px rgba(255,107,107,0.35)',
        flexShrink:     0,
      }}>
        🎓
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily:  "'Baloo 2', cursive",
          fontSize:    s.logo,
          fontWeight:  800,
          background:  'linear-gradient(135deg, #FF6B6B 0%, #9B8EFF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
          letterSpacing:        '-0.02em',
        }}>
          EduKids
        </span>
        {showTagline && (
          <span style={{
            fontFamily:    "'Nunito', sans-serif",
            fontSize:      s.tag,
            fontWeight:    600,
            color:         '#9E99B8',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginTop:     2,
          }}>
            Learn · Grow · Shine
          </span>
        )}
      </div>
    </div>
  )
}

export default Logo