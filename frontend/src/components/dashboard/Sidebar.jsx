// src/components/dashboard/Sidebar.jsx

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../shared/Logo'

const navItems = [
  { icon: '🏠', label: 'Tableau de bord', path: '/teacher/dashboard',         key: 'dashboard'  },
  { icon: '⚡', label: 'Session live',    path: '/teacher/session',            key: 'session'    },
  { icon: '👥', label: 'Mes élèves',      path: '/teacher/students',           key: 'students'   },
  { icon: '📊', label: 'Statistiques',    path: '/teacher/stats',              key: 'stats'      },
  { icon: '📅', label: 'Planning',        path: '/teacher/planning',           key: 'planning'   },
  { icon: '📬', label: 'Messages',        path: '/teacher/messages',           key: 'messages',  badge: 3 },
]

const Sidebar = ({ teacher, collapsed, onToggle }) => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [hovItem, setHovItem] = useState(null)

  const activeKey = navItems.find(i => location.pathname.includes(i.key))?.key || 'dashboard'

  return (
    <aside style={{
      ...styles.sidebar,
      width: collapsed ? 72 : 230,
      transition: 'width 300ms cubic-bezier(0.34,1.56,0.64,1)',
    }}>

      {/* Logo */}
      <div style={styles.logoWrap}>
        {!collapsed && <Logo size="sm" />}
        {collapsed && <span style={{ fontSize: 24 }}>🎓</span>}
        <button style={styles.collapseBtn} onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Teacher mini-profile */}
      {!collapsed && (
        <div style={styles.profile}>
          <div style={styles.avatarWrap}>
            <span style={{ fontSize: 22 }}>{teacher.avatar}</span>
          </div>
          <div style={styles.profileInfo}>
            <p style={styles.profileName}>{teacher.firstName} {teacher.lastName}</p>
            <p style={styles.profileSub}>{teacher.className} · {teacher.school}</p>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={styles.nav}>
        {navItems.map(item => {
          const isActive = activeKey === item.key
          return (
            <button
              key={item.key}
              style={{
                ...styles.navItem,
                background: isActive
                  ? 'rgba(155,142,255,0.12)'
                  : hovItem === item.key
                    ? 'rgba(155,142,255,0.06)'
                    : 'transparent',
                borderLeft: isActive ? '3px solid #9B8EFF' : '3px solid transparent',
                color:      isActive ? '#9B8EFF' : '#706C8A',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={() => setHovItem(item.key)}
              onMouseLeave={() => setHovItem(null)}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ''}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{
                    ...styles.navLabel,
                    fontWeight: isActive ? 800 : 600,
                  }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span style={styles.badge}>{item.badge}</span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom — déconnexion */}
      <div style={styles.bottom}>
        <button
          style={{
            ...styles.navItem,
            color:          '#FF6B6B',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onClick={() => navigate('/')}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          {!collapsed && <span style={styles.navLabel}>Se déconnecter</span>}
        </button>
      </div>

    </aside>
  )
}

const styles = {
  sidebar: {
    height:        '100vh',
    position:      'fixed',
    left:          0,
    top:           0,
    bottom:        0,
    display:       'flex',
    flexDirection: 'column',
    background:    'rgba(255,255,255,0.92)',
    backdropFilter:'blur(20px)',
    borderRight:   '1.5px solid rgba(200,196,220,0.22)',
    boxShadow:     '2px 0 20px rgba(100,90,150,0.06)',
    zIndex:        50,
    overflowX:     'hidden',
  },
  logoWrap: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '20px 16px 16px',
    borderBottom:   '1px solid rgba(200,196,220,0.15)',
    minHeight:      64,
    gap:            8,
  },
  collapseBtn: {
    width:        28,
    height:       28,
    borderRadius: 8,
    border:       '1.5px solid rgba(200,196,220,0.30)',
    background:   'rgba(248,247,255,0.8)',
    cursor:       'pointer',
    fontSize:     12,
    fontWeight:   700,
    color:        '#9E99B8',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    flexShrink:   0,
  },
  profile: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
    padding:    '14px 16px',
    borderBottom: '1px solid rgba(200,196,220,0.15)',
    margin:     '0',
  },
  avatarWrap: {
    width:          40,
    height:         40,
    borderRadius:   12,
    background:     '#F3F0FF',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    border:         '1.5px solid rgba(155,142,255,0.20)',
  },
  profileInfo: {
    overflow: 'hidden',
  },
  profileName: {
    fontFamily:  "'Baloo 2', cursive",
    fontSize:    '0.85rem',
    fontWeight:  700,
    color:       '#1A1830',
    whiteSpace:  'nowrap',
    overflow:    'hidden',
    textOverflow:'ellipsis',
  },
  profileSub: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.72rem',
    fontWeight: 500,
    color:      '#9E99B8',
    whiteSpace: 'nowrap',
    overflow:   'hidden',
    textOverflow:'ellipsis',
  },
  nav: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
    padding:       '12px 8px',
    overflowY:     'auto',
  },
  navItem: {
    display:     'flex',
    alignItems:  'center',
    gap:         10,
    padding:     '10px 12px',
    borderRadius:12,
    border:      'none',
    cursor:      'pointer',
    transition:  'all 200ms ease',
    width:       '100%',
    textAlign:   'left',
    whiteSpace:  'nowrap',
  },
  navLabel: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.88rem',
    flex:        1,
  },
  badge: {
    background:   '#FF6B6B',
    color:        '#fff',
    fontSize:     '0.68rem',
    fontWeight:   800,
    borderRadius: 9999,
    padding:      '1px 7px',
    minWidth:     20,
    textAlign:    'center',
  },
  bottom: {
    padding:    '8px 8px 16px',
    borderTop:  '1px solid rgba(200,196,220,0.15)',
  },
}

export default Sidebar