import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { parentAPI } from '../../api/client'

const TREND_STYLES = {
  good: { color: '#22C55E', bg: 'rgba(34,197,94,0.10)', label: 'Good day' },
  moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', label: 'Moderate day' },
  struggling: { color: '#EF4444', bg: 'rgba(239,68,68,0.10)', label: 'Difficult day' },
}

const SUBJECT_COLORS = {
  mathematics: '#9B8EFF',
  reading: '#FF6B6B',
  sciences: '#4ECDC4',
}

export default function ParentDailySummaryPage() {
  const navigate = useNavigate()
  const { studentId } = useParams()

  const storedUser = JSON.parse(localStorage.getItem('ek_user') || '{}')
  const parentId = storedUser?._id || storedUser?.id || ''

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  const trendStyle = useMemo(() => {
    return TREND_STYLES[summary?.dayTrend] || {
      color: '#9E99B8',
      bg: 'rgba(158,153,184,0.10)',
      label: summary?.hasData ? 'Pending' : 'Not ready',
    }
  }, [summary])

  const loadSummary = useCallback(
    async (selectedDate = date, silent = false) => {
      try {
        if (silent) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError('')

        const res = await parentAPI.getDailySummary(studentId, parentId, selectedDate)
        setSummary(res?.data || null)
      } catch (err) {
        setError(err.message || 'Unable to load summary')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [studentId, parentId, date]
  )

  useEffect(() => {
    loadSummary(date)
  }, [loadSummary, date])

  // Auto-refresh toutes les 10 secondes tant que le résumé n'est pas prêt
  useEffect(() => {
    if (!summary || summary.hasData) return

    const interval = setInterval(() => {
      loadSummary(date, true)
    }, 10000)

    return () => clearInterval(interval)
  }, [summary, date, loadSummary])

  // Recharge quand l'utilisateur revient sur l'onglet
  useEffect(() => {
    const onFocus = () => loadSummary(date, true)
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [date, loadSummary])

  const totalCounts = summary?.totalCounts || {
    understand: 0,
    confused: 0,
    overwhelmed: 0,
    help: 0,
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <button style={styles.backBtn} onClick={() => navigate('/parent/dashboard')}>
            ← My children
          </button>

          <div style={styles.headerInfo}>
            <p style={styles.kicker}>DAILY SUMMARY</p>
            <h1 style={styles.title}>{summary?.studentName || 'Child summary'}</h1>
            <p style={styles.subtitle}>Recap of all sessions for the selected day</p>
          </div>

          <div style={styles.topRight}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.dateInput}
            />

            <button
              onClick={() => loadSummary(date, true)}
              style={styles.refreshBtn}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        {loading && (
          <div style={styles.loadingCard}>
            <p style={styles.loadingText}>Loading daily summary…</p>
          </div>
        )}

        {!loading && error && (
          <div style={styles.errorCard}>
            <p style={styles.errorText}>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && summary && (
          <>
            {!summary.hasData ? (
              <div style={styles.emptyCard}>
                <h3 style={styles.emptyTitle}>Summary not ready yet</h3>
                <p style={styles.emptyText}>
                  No daily summary is available for this child on {summary.date}.
                </p>
                <p style={styles.pendingText}>
                  The page refreshes automatically after session end.
                </p>
              </div>
            ) : (
              <>
                <div style={styles.heroGrid}>
                  <div style={styles.heroCard}>
                    <p style={styles.metricLabel}>Average engagement</p>
                    <h2 style={styles.metricValue}>
                      {summary.avgEngagementScore ?? 0}
                      <span style={styles.metricUnit}>/100</span>
                    </h2>
                    <div
                      style={{
                        ...styles.trendBadge,
                        color: trendStyle.color,
                        background: trendStyle.bg,
                      }}
                    >
                      {trendStyle.label}
                    </div>
                  </div>

                  <div style={styles.heroCard}>
                    <p style={styles.metricLabel}>Sessions today</p>
                    <h2 style={styles.metricValue}>{summary.totalSessions}</h2>
                    <p style={styles.metricSub}>
                      Generated at{' '}
                      {summary.generatedAt
                        ? new Date(summary.generatedAt).toLocaleTimeString()
                        : '—'}
                    </p>
                  </div>

                  <div style={styles.heroCard}>
                    <p style={styles.metricLabel}>Total button presses</p>
                    <h2 style={styles.metricValue}>{summary.totalPresses}</h2>
                    <p style={styles.metricSub}>Across all sessions of the day</p>
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={styles.mainCol}>
                    <div style={styles.card}>
                      <h3 style={styles.cardTitle}>Session recap</h3>

                      <div style={styles.sessionList}>
                        {(summary.sessions || []).map((session, index) => (
                          <div key={session.sessionId || index} style={styles.sessionItem}>
                            <div style={styles.sessionTop}>
                              <span
                                style={{
                                  ...styles.subjectBadge,
                                  background: `${SUBJECT_COLORS[session.subject] || '#9E99B8'}15`,
                                  color: SUBJECT_COLORS[session.subject] || '#9E99B8',
                                }}
                              >
                                {session.subjectLabel}
                              </span>

                              <span style={styles.sessionScore}>
                                {session.engagementScore ?? 0}/100
                              </span>
                            </div>

                            <p style={styles.sessionTrend}>
                              Trend: {session.trendLabel || 'No trend'}
                            </p>

                            <p style={styles.sessionTime}>
                              {session.startedAt
                                ? new Date(session.startedAt).toLocaleTimeString()
                                : '—'}
                              {' → '}
                              {session.endedAt
                                ? new Date(session.endedAt).toLocaleTimeString()
                                : '—'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={styles.card}>
                      <h3 style={styles.cardTitle}>Advice for tonight</h3>
                      <p style={styles.adviceText}>
                        {summary.parentAdvice || 'No advice available for this day.'}
                      </p>
                    </div>
                  </div>

                  <div style={styles.sideCol}>
                    <div style={styles.card}>
                      <h3 style={styles.cardTitle}>Button totals</h3>
                      <div style={styles.countList}>
                        <CountRow label="Understand" value={totalCounts.understand} color="#22C55E" />
                        <CountRow label="Confused" value={totalCounts.confused} color="#F59E0B" />
                        <CountRow label="Overwhelmed" value={totalCounts.overwhelmed} color="#9B8EFF" />
                        <CountRow label="Help" value={totalCounts.help} color="#EF4444" />
                      </div>
                    </div>

                    <div style={styles.card}>
                      <h3 style={styles.cardTitle}>Child info</h3>
                      <p style={styles.infoLine}>
                        <strong>Name:</strong> {summary.studentName}
                      </p>
                      <p style={styles.infoLine}>
                        <strong>Date:</strong> {summary.date}
                      </p>
                      <p style={styles.infoLine}>
                        <strong>Support profile:</strong> {summary.supportProfile || 'none'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CountRow({ label, value, color }) {
  return (
    <div style={styles.countRow}>
      <span style={styles.countLabel}>{label}</span>
      <span style={{ ...styles.countValue, color }}>{value}</span>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFF9F4 0%, #F8F7FF 100%)',
    padding: 24,
    fontFamily: "'Nunito', sans-serif",
  },
  container: {
    maxWidth: 1280,
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  backBtn: {
    border: 'none',
    background: 'transparent',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#9E99B8',
    cursor: 'pointer',
  },
  headerInfo: {
    flex: 1,
  },
  kicker: {
    fontSize: '0.78rem',
    fontWeight: 800,
    color: '#FF6B6B',
    letterSpacing: '0.08em',
    margin: 0,
  },
  title: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#1A1830',
    margin: '6px 0 2px',
  },
  subtitle: {
    margin: 0,
    color: '#9E99B8',
    fontWeight: 600,
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
  },
  dateInput: {
    border: '1.5px solid #E6E1FA',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: '0.95rem',
    fontFamily: "'Nunito', sans-serif",
    outline: 'none',
  },
  refreshBtn: {
    border: 'none',
    borderRadius: 14,
    background: '#9B8EFF',
    color: '#fff',
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  loadingCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 32,
  },
  loadingText: {
    margin: 0,
    color: '#9E99B8',
    fontWeight: 700,
  },
  errorCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 32,
    border: '1px solid rgba(239,68,68,0.18)',
  },
  errorText: {
    margin: 0,
    color: '#EF4444',
    fontWeight: 700,
  },
  emptyCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 36,
    textAlign: 'center',
  },
  emptyTitle: {
    margin: 0,
    color: '#1A1830',
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.5rem',
  },
  emptyText: {
    marginTop: 8,
    color: '#9E99B8',
    fontWeight: 600,
  },
  pendingText: {
    marginTop: 14,
    color: '#B0AACB',
    fontWeight: 700,
    fontSize: '0.92rem',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 18,
    marginBottom: 20,
  },
  heroCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 8px 30px rgba(100,90,150,0.06)',
  },
  metricLabel: {
    margin: 0,
    color: '#9E99B8',
    fontWeight: 700,
  },
  metricValue: {
    margin: '10px 0 8px',
    fontFamily: "'Baloo 2', cursive",
    fontSize: '2.4rem',
    color: '#1A1830',
    lineHeight: 1,
  },
  metricUnit: {
    fontSize: '1.2rem',
    color: '#B0AACB',
    marginLeft: 4,
  },
  metricSub: {
    margin: 0,
    color: '#9E99B8',
    fontWeight: 600,
  },
  trendBadge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: 9999,
    fontWeight: 800,
    fontSize: '0.85rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 0.7fr',
    gap: 20,
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 8px 30px rgba(100,90,150,0.06)',
  },
  cardTitle: {
    margin: 0,
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.3rem',
    color: '#1A1830',
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginTop: 18,
  },
  sessionItem: {
    border: '1px solid #F0EBFF',
    borderRadius: 18,
    padding: 16,
    background: '#FCFBFF',
  },
  sessionTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  subjectBadge: {
    display: 'inline-flex',
    padding: '7px 12px',
    borderRadius: 9999,
    fontWeight: 800,
    fontSize: '0.82rem',
  },
  sessionScore: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.15rem',
    fontWeight: 800,
    color: '#1A1830',
  },
  sessionTrend: {
    margin: '0 0 6px',
    color: '#706C8A',
    fontWeight: 700,
  },
  sessionTime: {
    margin: 0,
    color: '#9E99B8',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  adviceText: {
    marginTop: 16,
    color: '#4A4666',
    fontWeight: 600,
    lineHeight: 1.8,
  },
  countList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginTop: 18,
  },
  countRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countLabel: {
    color: '#706C8A',
    fontWeight: 700,
  },
  countValue: {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '1.2rem',
    fontWeight: 800,
  },
  infoLine: {
    margin: '12px 0 0',
    color: '#4A4666',
    fontWeight: 600,
    lineHeight: 1.6,
  },
}