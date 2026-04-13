const THEMES = [
  { bg: '#7c3aed', av: '#5b21b6' },
  { bg: '#0891b2', av: '#0e7490' },
  { bg: '#db2777', av: '#be185d' },
  { bg: '#16a34a', av: '#15803d' },
  { bg: '#d97706', av: '#b45309' },
  { bg: '#4f46e5', av: '#3730a3' },
]

const BADGE_LABELS = {
  none:     'No profile',
  adhd:     'ADHD',
  autism:   'Autism',
  dyslexia: 'Dyslexia',
}

export default function ChildCard({ child, index }) {
  const theme    = THEMES[index % THEMES.length]
  const initials = (child.firstName[0] + child.lastName[0]).toUpperCase()

  return (
    <div style={{ background: theme.bg, borderRadius: 24, overflow: 'hidden', cursor: 'pointer', transition: 'transform .18s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Top */}
      <div style={{ padding: '1.4rem 1.4rem 1rem' }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%',
          background: theme.av, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, marginBottom: 14,
        }}>
          {initials}
        </div>
        <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, margin: '0 0 2px' }}>
          {child.firstName} {child.lastName}
        </p>
        <span style={{
          display: 'inline-block', marginTop: 10,
          background: 'rgba(255,255,255,0.22)', color: 'rgba(255,255,255,0.92)',
          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
        }}>
          {BADGE_LABELS[child.supportProfile] ?? child.supportProfile}
        </span>
      </div>

      {/* Bottom — Student ID */}
      <div style={{
        padding: '.9rem 1.4rem 1.1rem',
        background: 'rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em' }}>
          Student ID
        </span>
        <span style={{
          fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          color: '#fff', background: 'rgba(255,255,255,0.2)',
          borderRadius: 8, padding: '3px 9px', letterSpacing: '.06em',
        }}>
          {child.studentCode}
        </span>
      </div>
    </div>
  )
}