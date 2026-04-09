import { useState } from 'react'
import AppShell from '../layout/AppShell'
import useDashboard from '../../hooks/useDashboard'
import ClassScoreCard from './ClassScoreCard'
import TrendChart from './TrendChart'
import StudentPieCard from './StudentPieCard'
import RecommendationCards from './RecommendationCards'
import ChatWidget from '../shared/ChatWidget'

// ─────────────────────────────────────────
// TeacherDashboard
// Same content / cleaner structure with AppShell
// ─────────────────────────────────────────
const TeacherDashboard = () => {
  const [subject, setSubject] = useState('mathematics')

  const {
    connected,
    classScore,
    classHistory,
    trend,
    breakdown,
    recommendations,
    students,
    loading
  } = useDashboard(subject)

  return (
    <AppShell>
      <div style={styles.pageContent}>
        {/* Header / Hero */}
        <div style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.badge}>Teacher Space</div>

            <h1 style={styles.title}>Teacher Dashboard</h1>

            <div style={styles.subtitle}>
              Real-time class engagement monitoring
            </div>

            <div style={styles.heroBottom}>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={styles.select}
              >
                <option value="mathematics">Mathematics</option>
                <option value="reading">Reading</option>
                <option value="sciences">Sciences</option>
                <option value="general">General</option>
              </select>

              <div style={styles.connStatus}>
                <div
                  style={{
                    ...styles.connDot,
                    background: connected ? '#7ED957' : '#FF7B89'
                  }}
                />
                <span style={styles.connText}>
                  {connected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroCircle}>👩‍🏫</div>

            <div style={styles.heroMiniCard}>
              <div style={styles.heroMiniTop}>Current subject</div>
              <div style={styles.heroMiniBottom}>
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        {loading ? (
          <div style={styles.loadingCard}>
            <div style={styles.loadingEmoji}>✨</div>
            <div style={styles.loading}>Loading dashboard...</div>
          </div>
        ) : (
          <>
            <div style={styles.block}>
              <ClassScoreCard
                classScore={classScore}
                breakdown={breakdown}
                trend={trend}
              />
            </div>

            <div style={styles.block}>
              <TrendChart
                classHistory={classHistory}
                trend={trend}
              />
            </div>

            <div style={styles.block}>
              <RecommendationCards
                recommendations={recommendations}
                trend={trend}
              />
            </div>

            <div style={styles.studentsSection}>
              <div style={styles.studentsHeader}>
                <div>
                  <div style={styles.sectionPill}>Students</div>
                  <div style={styles.sectionTitle}>
                    Individual engagement
                  </div>
                </div>

                <div style={styles.studentsCounter}>
                  {students.length} student{students.length !== 1 ? 's' : ''}
                </div>
              </div>

              {students.length === 0 ? (
                <div style={styles.noStudentsBox}>
                  <div style={styles.noStudentsEmoji}>🌟</div>
                  <div style={styles.noStudents}>
                    No active sessions — start a session to see student data.
                  </div>
                </div>
              ) : (
                <div style={styles.studentsGrid}>
                  {students.map(student => (
                    <div key={student.sessionId} style={styles.studentWrap}>
                      <StudentPieCard student={student} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <ChatWidget role="teacher" />
      </div>
    </AppShell>
  )
}

const styles = {
  pageContent: {
    position: 'relative',
    zIndex: 2
  },

  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
    padding: '28px 30px',
    borderRadius: 32,
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.9)',
    boxShadow: '0 18px 45px rgba(186, 160, 255, 0.14)',
    marginBottom: 22
  },

  heroLeft: {
    flex: 1,
    minWidth: 260
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderRadius: 999,
    background: 'linear-gradient(135deg, #F7E8FF, #FFE8D9)',
    color: '#8E67D8',
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 14,
    letterSpacing: 0.3
  },

  title: {
    margin: 0,
    fontSize: 'clamp(30px, 4vw, 44px)',
    lineHeight: 1.05,
    fontWeight: 800,
    color: '#7C59C8'
  },

  subtitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 1.5,
    color: '#6E6A86',
    maxWidth: 560,
    fontWeight: 700
  },

  heroBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    marginTop: 22
  },

  select: {
    padding: '12px 16px',
    borderRadius: 16,
    border: '1px solid rgba(142, 103, 216, 0.16)',
    background: '#FFFFFF',
    color: '#5E5A75',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)'
  },

  connStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: 16,
    boxShadow: '0 8px 18px rgba(0,0,0,0.05)'
  },

  connDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(0,0,0,0.12)'
  },

  connText: {
    fontSize: 13,
    fontWeight: 700,
    color: '#6E6A86'
  },

  heroRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    minWidth: 180
  },

  heroCircle: {
    width: 112,
    height: 112,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
    background: 'linear-gradient(135deg, #FCE7F3, #E9D5FF, #FFE8D6)',
    boxShadow: '0 14px 30px rgba(197, 181, 255, 0.22)',
    border: '1px solid rgba(255,255,255,0.9)'
  },

  heroMiniCard: {
    width: '100%',
    maxWidth: 180,
    background: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    padding: '14px 16px',
    textAlign: 'center',
    boxShadow: '0 10px 24px rgba(0,0,0,0.05)'
  },

  heroMiniTop: {
    fontSize: 12,
    color: '#9C97B6',
    marginBottom: 6,
    fontWeight: 700
  },

  heroMiniBottom: {
    fontSize: 15,
    color: '#7C59C8',
    fontWeight: 800
  },

  block: {
    marginBottom: 18
  },

  loadingCard: {
    padding: '42px 20px',
    borderRadius: 28,
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(12px)',
    textAlign: 'center',
    boxShadow: '0 16px 35px rgba(0,0,0,0.05)'
  },

  loadingEmoji: {
    fontSize: 30,
    marginBottom: 8
  },

  loading: {
    fontSize: 15,
    color: '#7B7794',
    fontWeight: 700
  },

  studentsSection: {
    marginTop: 8,
    background: 'rgba(255,255,255,0.68)',
    borderRadius: 30,
    padding: '22px',
    border: '1px solid rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 18px 40px rgba(186, 160, 255, 0.10)'
  },

  studentsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 18
  },

  sectionPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: 999,
    background: '#FDE7F3',
    color: '#D45FA8',
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 8
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: '#5E5682'
  },

  studentsCounter: {
    padding: '9px 14px',
    borderRadius: 999,
    background: 'linear-gradient(135deg, #E9D5FF, #FFE9D9)',
    color: '#7C59C8',
    fontSize: 13,
    fontWeight: 800
  },

  studentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16
  },

  studentWrap: {
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 6,
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
  },

  noStudentsBox: {
    background: 'rgba(255,255,255,0.88)',
    borderRadius: 22,
    padding: '28px 18px',
    textAlign: 'center',
    border: '2px dashed #E7D8FF'
  },

  noStudentsEmoji: {
    fontSize: 28,
    marginBottom: 10
  },

  noStudents: {
    fontSize: 14,
    color: '#837E9D',
    fontStyle: 'italic',
    lineHeight: 1.6,
    fontWeight: 600
  }
}

export default TeacherDashboard