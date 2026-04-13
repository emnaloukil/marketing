// src/pages/teacher/TeacherDashboard.jsx
// Dashboard complet enseignant — layout sidebar + main content

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Sidebar         from '../../components/dashboard/Sidebar'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import StatCard        from '../../components/dashboard/StatCard'
import StudentList     from '../../components/dashboard/StudentList'
import { SessionCard, PlanningCard, AlertCard } from '../../components/dashboard/SessionCard'

import {
  mockTeacher,
  mockStudents,
  mockActiveSession,
  mockRecentSessions,
  mockPlanning,
  mockAlerts,
  mockStats,
} from '../../data/teacherMockData'

const SIDEBAR_OPEN     = 230
const SIDEBAR_COLLAPSED = 72

const TeacherDashboard = () => {
  const navigate  = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [startingSession, setStartingSession] = useState(false)

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_OPEN

  const handleStartSession = async () => {
    setStartingSession(true)
    // ── API CALL future ──────────────────────────────────────────────
    // const res = await sessionsAPI.start({
    //   teacherId: teacher.id,
    //   classId:   teacher.className,
    //   subject:   'mathematics',
    // }, token)
    // navigate(`/teacher/session/${res.data.sessionId}`)
    // ────────────────────────────────────────────────────────────────
    await new Promise(r => setTimeout(r, 800))
    setStartingSession(false)
    navigate('/teacher/session')
  }

  return (
    <div style={styles.root}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <Sidebar
        teacher={mockTeacher}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div style={{
        ...styles.main,
        marginLeft: sidebarWidth,
        transition: 'margin-left 300ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Header */}
        <DashboardHeader
          teacher={mockTeacher}
          activeSession={mockActiveSession}
          sidebarWidth={sidebarWidth}
        />

        {/* Page content */}
        <div style={styles.content}>

          {/* ── Session active banner ───────────────────────────────────── */}
          <LiveSessionBanner
            session={mockActiveSession}
            onJoin={() => navigate('/teacher/session')}
            onStart={handleStartSession}
            starting={startingSession}
          />

          {/* ── Stats ──────────────────────────────────────────────────── */}
          <div style={styles.statsGrid}>
            {mockStats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>

          {/* ── Grid principale ────────────────────────────────────────── */}
          <div style={styles.mainGrid}>

            {/* Colonne gauche — large */}
            <div style={styles.leftCol}>

              {/* Liste élèves */}
              <StudentList students={mockStudents} />

              {/* Sessions récentes */}
              <SectionBlock title="📋 Sessions récentes">
                <div style={styles.sessionsGrid}>
                  {mockRecentSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </SectionBlock>

            </div>

            {/* Colonne droite — étroite */}
            <div style={styles.rightCol}>

              {/* Alertes */}
              <SectionBlock
                title="🔔 Alertes"
                badge={mockAlerts.filter(a => a.type === 'alert').length}
                badgeColor="#FF6B6B"
              >
                <div style={styles.alertsList}>
                  {mockAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </SectionBlock>

              {/* Planning du jour */}
              <SectionBlock title="📅 Planning du jour">
                <div style={styles.planningList}>
                  {mockPlanning.map(item => (
                    <PlanningCard key={item.id} item={item} />
                  ))}
                </div>
              </SectionBlock>

              {/* Score breakdown visuel */}
              <BreakdownCard session={mockActiveSession} />

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── LiveSessionBanner ─────────────────────────────────────────────────────────
const LiveSessionBanner = ({ session, onJoin, onStart, starting }) => {
  const [hovJoin, setHovJoin]   = useState(false)
  const [hovStart, setHovStart] = useState(false)

  if (session) {
    return (
      <div style={styles.liveBanner}>
        <div style={styles.liveBannerLeft}>
          <div style={styles.livePulse}>
            <span style={styles.livePulseDot} />
            <span style={styles.livePulseRing} />
          </div>
          <div>
            <p style={styles.liveBannerTitle}>Session en cours · {session.title}</p>
            <p style={styles.liveBannerSub}>
              Démarrée à {session.startedAt} · {session.duration} · Score : {session.classScore}/100
            </p>
          </div>
        </div>
        <button
          style={{
            ...styles.joinBtn,
            boxShadow: hovJoin ? '0 6px 20px rgba(78,205,196,0.35)' : '0 2px 10px rgba(78,205,196,0.20)',
            transform: hovJoin ? 'scale(1.04)' : 'scale(1)',
          }}
          onMouseEnter={() => setHovJoin(true)}
          onMouseLeave={() => setHovJoin(false)}
          onClick={onJoin}
        >
          Rejoindre le dashboard live →
        </button>
      </div>
    )
  }

  return (
    <div style={styles.noSessionBanner}>
      <div>
        <p style={styles.noSessionTitle}>Aucune session active</p>
        <p style={styles.noSessionSub}>Démarrez une session pour voir l'engagement de votre classe en temps réel.</p>
      </div>
      <button
        style={{
          ...styles.startBtn,
          boxShadow: hovStart ? '0 6px 20px rgba(155,142,255,0.40)' : '0 2px 10px rgba(155,142,255,0.22)',
          transform: hovStart ? 'scale(1.04)' : 'scale(1)',
        }}
        onMouseEnter={() => setHovStart(true)}
        onMouseLeave={() => setHovStart(false)}
        onClick={onStart}
        disabled={starting}
      >
        {starting ? '⏳ Démarrage…' : '⚡ Démarrer une session'}
      </button>
    </div>
  )
}

// ── BreakdownCard ─────────────────────────────────────────────────────────────
const BreakdownCard = ({ session }) => {
  const { breakdown, buttonTotals } = session
  const total = breakdown.total || 1

  const segments = [
    { label: 'En forme',   count: breakdown.good,    color: '#4ECDC4', pct: Math.round(breakdown.good    / total * 100) },
    { label: 'Attention',  count: breakdown.warning,  color: '#FFB347', pct: Math.round(breakdown.warning / total * 100) },
    { label: 'En alerte',  count: breakdown.alert,    color: '#FF6B6B', pct: Math.round(breakdown.alert   / total * 100) },
  ]

  const buttons = [
    { label: '✅ Comprend',    count: buttonTotals.understand,  color: '#4ECDC4' },
    { label: '❓ Confus',      count: buttonTotals.confused,    color: '#FFB347' },
    { label: '😰 Débordé',    count: buttonTotals.overwhelmed,  color: '#9B8EFF' },
    { label: '🆘 Aide',        count: buttonTotals.help,         color: '#FF6B6B' },
  ]

  const totalBtns = Object.values(buttonTotals).reduce((a, b) => a + b, 0)

  return (
    <div style={styles.breakdownCard}>
      <h3 style={styles.sectionTitle}>📊 Répartition live</h3>

      {/* Donut simplifié — barre segmentée */}
      <div style={styles.segBar}>
        {segments.map(seg => (
          <div key={seg.label} style={{
            ...styles.segBarItem,
            width:      `${seg.pct}%`,
            background: seg.color,
          }} title={`${seg.label}: ${seg.count}`} />
        ))}
      </div>

      <div style={styles.segLegend}>
        {segments.map(seg => (
          <div key={seg.label} style={styles.segLegendItem}>
            <span style={{ ...styles.segDot, background: seg.color }} />
            <span style={styles.segLegendLabel}>{seg.label}</span>
            <span style={{ ...styles.segLegendCount, color: seg.color }}>{seg.count}</span>
          </div>
        ))}
      </div>

      {/* Buttons totals */}
      <div style={styles.btnTotals}>
        <p style={styles.btnTotalsTitle}>Pressions totales · {totalBtns}</p>
        {buttons.map(btn => (
          <div key={btn.label} style={styles.btnTotalRow}>
            <span style={styles.btnTotalLabel}>{btn.label}</span>
            <div style={styles.btnTotalBarWrap}>
              <div style={{
                ...styles.btnTotalBar,
                width:      `${Math.round(btn.count / totalBtns * 100)}%`,
                background: btn.color,
              }} />
            </div>
            <span style={{ ...styles.btnTotalCount, color: btn.color }}>{btn.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SectionBlock wrapper ──────────────────────────────────────────────────────
const SectionBlock = ({ title, badge, badgeColor, children }) => (
  <div style={styles.sectionBlock}>
    <div style={styles.sectionHeader}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {badge !== undefined && (
        <span style={{ ...styles.sectionBadge, background: badgeColor }}>
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
)

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight:  '100vh',
    background: 'linear-gradient(180deg, #FFF9F4 0%, #FFFDFB 50%, #F8F7FF 100%)',
    fontFamily: "'Nunito', sans-serif",
  },
  main: {
    minHeight: '100vh',
  },
  content: {
    padding:   '96px 28px 40px',
    maxWidth:  1400,
    margin:    '0 auto',
    display:   'flex',
    flexDirection: 'column',
    gap:       24,
  },

  statsGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap:                 18,
  },

  mainGrid: {
    display:             'grid',
    gridTemplateColumns: '1fr 340px',
    gap:                 24,
    alignItems:          'start',
  },

  leftCol: {
    display:       'flex',
    flexDirection: 'column',
    gap:           24,
  },

  rightCol: {
    display:       'flex',
    flexDirection: 'column',
    gap:           20,
  },

  // Live banner
  liveBanner: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '16px 22px',
    background:     'rgba(78,205,196,0.08)',
    border:         '1.5px solid rgba(78,205,196,0.25)',
    borderRadius:   18,
    flexWrap:       'wrap',
    gap:            16,
  },
  liveBannerLeft: {
    display:    'flex',
    alignItems: 'center',
    gap:        16,
  },
  livePulse: {
    position:  'relative',
    width:     20,
    height:    20,
    flexShrink: 0,
  },
  livePulseDot: {
    position:     'absolute',
    inset:        0,
    margin:       'auto',
    width:        10,
    height:       10,
    borderRadius: '50%',
    background:   '#4ECDC4',
    display:      'block',
  },
  livePulseRing: {
    position:     'absolute',
    inset:        0,
    borderRadius: '50%',
    border:       '2px solid rgba(78,205,196,0.5)',
    animation:    'pulse-soft 1.5s ease-in-out infinite',
    display:      'block',
  },
  liveBannerTitle: {
    fontFamily:   "'Baloo 2', cursive",
    fontSize:     '0.95rem',
    fontWeight:   800,
    color:        '#1A1830',
    marginBottom: 2,
  },
  liveBannerSub: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.78rem',
    fontWeight: 500,
    color:      '#9E99B8',
  },
  joinBtn: {
    padding:      '10px 22px',
    borderRadius: 9999,
    border:       'none',
    background:   'linear-gradient(135deg, #4ECDC4 0%, #44B8B0 100%)',
    color:        '#fff',
    fontFamily:   "'Nunito', sans-serif",
    fontSize:     '0.86rem',
    fontWeight:   800,
    cursor:       'pointer',
    transition:   'all 250ms cubic-bezier(0.34,1.56,0.64,1)',
    whiteSpace:   'nowrap',
  },

  noSessionBanner: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '16px 22px',
    background:     'rgba(155,142,255,0.06)',
    border:         '1.5px dashed rgba(155,142,255,0.25)',
    borderRadius:   18,
    flexWrap:       'wrap',
    gap:            16,
  },
  noSessionTitle: {
    fontFamily:   "'Baloo 2', cursive",
    fontSize:     '0.95rem',
    fontWeight:   800,
    color:        '#9B8EFF',
    marginBottom: 4,
  },
  noSessionSub: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.80rem',
    fontWeight: 500,
    color:      '#9E99B8',
  },
  startBtn: {
    padding:      '10px 22px',
    borderRadius: 9999,
    border:       'none',
    background:   'linear-gradient(135deg, #9B8EFF 0%, #74C0FC 100%)',
    color:        '#fff',
    fontFamily:   "'Nunito', sans-serif",
    fontSize:     '0.86rem',
    fontWeight:   800,
    cursor:       'pointer',
    transition:   'all 250ms cubic-bezier(0.34,1.56,0.64,1)',
    whiteSpace:   'nowrap',
  },

  sessionsGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap:                 14,
  },

  alertsList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
  },

  planningList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
  },

  sectionBlock: {
    background:     'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(12px)',
    borderRadius:   20,
    padding:        '18px 20px',
    border:         '1.5px solid rgba(255,255,255,0.90)',
    boxShadow:      '0 2px 16px rgba(100,90,150,0.07)',
  },

  sectionHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   14,
  },

  sectionTitle: {
    fontFamily:    "'Baloo 2', cursive",
    fontSize:      '0.95rem',
    fontWeight:    800,
    color:         '#1A1830',
    letterSpacing: '-0.01em',
  },

  sectionBadge: {
    color:        '#fff',
    fontSize:     '0.70rem',
    fontWeight:   800,
    borderRadius: 9999,
    padding:      '2px 8px',
    minWidth:     20,
    textAlign:    'center',
  },

  // BreakdownCard
  breakdownCard: {
    background:     'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(12px)',
    borderRadius:   20,
    padding:        '18px 20px',
    border:         '1.5px solid rgba(255,255,255,0.90)',
    boxShadow:      '0 2px 16px rgba(100,90,150,0.07)',
  },

  segBar: {
    display:      'flex',
    height:       10,
    borderRadius: 9999,
    overflow:     'hidden',
    gap:          2,
    marginTop:    12,
    marginBottom: 12,
  },
  segBarItem: {
    height:       '100%',
    borderRadius: 9999,
    transition:   'width 600ms ease',
  },
  segLegend: {
    display:       'flex',
    flexDirection: 'column',
    gap:           7,
    marginBottom:  18,
  },
  segLegendItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
  },
  segDot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
    flexShrink:   0,
  },
  segLegendLabel: {
    flex:       1,
    fontSize:   '0.78rem',
    fontWeight: 600,
    color:      '#706C8A',
  },
  segLegendCount: {
    fontFamily: "'Baloo 2', cursive",
    fontSize:   '0.82rem',
    fontWeight: 800,
  },

  btnTotals: {
    borderTop:  '1px solid rgba(200,196,220,0.15)',
    paddingTop: 14,
  },
  btnTotalsTitle: {
    fontFamily:   "'Nunito', sans-serif",
    fontSize:     '0.74rem',
    fontWeight:   700,
    color:        '#9E99B8',
    textTransform:'uppercase',
    letterSpacing:'0.05em',
    marginBottom: 10,
  },
  btnTotalRow: {
    display:     'flex',
    alignItems:  'center',
    gap:         8,
    marginBottom: 7,
  },
  btnTotalLabel: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.74rem',
    fontWeight: 600,
    color:      '#706C8A',
    width:      90,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  btnTotalBarWrap: {
    flex:         1,
    height:       5,
    background:   '#F0EEF8',
    borderRadius: 9999,
    overflow:     'hidden',
  },
  btnTotalBar: {
    height:       '100%',
    borderRadius: 9999,
    transition:   'width 600ms ease',
  },
  btnTotalCount: {
    fontFamily: "'Baloo 2', cursive",
    fontSize:   '0.80rem',
    fontWeight: 800,
    minWidth:   22,
    textAlign:  'right',
  },
}

export default TeacherDashboard