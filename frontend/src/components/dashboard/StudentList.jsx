// src/components/dashboard/StudentList.jsx

import { useState } from 'react'

const statusConfig = {
  good:    { color: '#4ECDC4', bg: 'rgba(78,205,196,0.10)',  label: 'Bien',         dot: '#4ECDC4' },
  warning: { color: '#FFB347', bg: 'rgba(255,179,71,0.10)',  label: 'Attention',    dot: '#FFB347' },
  alert:   { color: '#FF6B6B', bg: 'rgba(255,107,107,0.10)', label: 'Aide requise', dot: '#FF6B6B' },
}

const profileLabels = {
  none:     null,
  adhd:     { label: 'TDAH',     color: '#9B8EFF', bg: 'rgba(155,142,255,0.10)' },
  dyslexia: { label: 'Dyslexie', color: '#FFB347', bg: 'rgba(255,179,71,0.10)'  },
  autism:   { label: 'TSA',      color: '#4ECDC4', bg: 'rgba(78,205,196,0.10)'  },
}

const StudentList = ({ students }) => {
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')
  const [hovRow, setHovRow]   = useState(null)

  const filters = [
    { key: 'all',     label: 'Tous',         count: students.length },
    { key: 'good',    label: '🟢 Bien',       count: students.filter(s => s.status === 'good').length    },
    { key: 'warning', label: '🟡 Attention',  count: students.filter(s => s.status === 'warning').length },
    { key: 'alert',   label: '🔴 Aide',       count: students.filter(s => s.status === 'alert').length   },
  ]

  const filtered = students.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter
    const matchSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div style={styles.wrap}>

      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>👥 Mes élèves</h3>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Rechercher un élève…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {filters.map(f => (
          <button
            key={f.key}
            style={{
              ...styles.filterBtn,
              background: filter === f.key ? '#9B8EFF' : 'rgba(248,247,255,0.8)',
              color:      filter === f.key ? '#fff' : '#706C8A',
              border:     filter === f.key ? 'none' : '1.5px solid rgba(200,196,220,0.25)',
              boxShadow:  filter === f.key ? '0 3px 12px rgba(155,142,255,0.28)' : 'none',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span style={{
              ...styles.filterCount,
              background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'rgba(155,142,255,0.10)',
              color:      filter === f.key ? '#fff' : '#9B8EFF',
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Élève', 'Profil', 'Score', 'Tendance', 'Statut', 'Vu à'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(student => {
              const sc = statusConfig[student.status]
              const pc = profileLabels[student.supportProfile]

              return (
                <tr
                  key={student.id}
                  style={{
                    ...styles.tr,
                    background: hovRow === student.id
                      ? 'rgba(155,142,255,0.04)'
                      : 'transparent',
                  }}
                  onMouseEnter={() => setHovRow(student.id)}
                  onMouseLeave={() => setHovRow(null)}
                >
                  {/* Élève */}
                  <td style={styles.td}>
                    <div style={styles.studentCell}>
                      <div style={styles.avatar}>
                        <span style={{ fontSize: 16 }}>{student.avatar}</span>
                      </div>
                      <div>
                        <p style={styles.studentName}>
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Profil */}
                  <td style={styles.td}>
                    {pc ? (
                      <span style={{
                        ...styles.profileBadge,
                        color:      pc.color,
                        background: pc.bg,
                      }}>
                        {pc.label}
                      </span>
                    ) : (
                      <span style={styles.noBadge}>—</span>
                    )}
                  </td>

                  {/* Score */}
                  <td style={styles.td}>
                    <div style={styles.scoreCell}>
                      <div style={styles.scoreBar}>
                        <div style={{
                          ...styles.scoreFill,
                          width:      `${student.score}%`,
                          background: sc.dot,
                        }} />
                      </div>
                      <span style={{ ...styles.scoreNum, color: sc.dot }}>
                        {student.score}
                      </span>
                    </div>
                  </td>

                  {/* Tendance */}
                  <td style={styles.td}>
                    <span style={{
                      ...styles.trendBadge,
                      color: student.trend === 'up'
                        ? '#4ECDC4'
                        : student.trend === 'down'
                          ? '#FF6B6B'
                          : '#9E99B8',
                    }}>
                      {student.trend === 'up' ? '↑ Hausse' : student.trend === 'down' ? '↓ Baisse' : '→ Stable'}
                    </span>
                  </td>

                  {/* Statut */}
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      color:      sc.color,
                      background: sc.bg,
                    }}>
                      <span style={{ ...styles.statusDot, background: sc.dot }} />
                      {sc.label}
                    </span>
                  </td>

                  {/* Vu à */}
                  <td style={styles.td}>
                    <span style={styles.lastSeen}>{student.lastSeen}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.empty}>
            <span style={{ fontSize: 32 }}>🔍</span>
            <p style={styles.emptyText}>Aucun élève ne correspond à cette recherche.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    background:     'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(12px)',
    borderRadius:   20,
    border:         '1.5px solid rgba(255,255,255,0.90)',
    boxShadow:      '0 4px 24px rgba(100,90,150,0.08)',
    overflow:       'hidden',
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '20px 22px 16px',
    borderBottom:   '1px solid rgba(200,196,220,0.15)',
    flexWrap:       'wrap',
    gap:            12,
  },
  title: {
    fontFamily:    "'Baloo 2', cursive",
    fontSize:      '1.08rem',
    fontWeight:    800,
    color:         '#1A1830',
    letterSpacing: '-0.01em',
  },
  searchWrap: {
    position:     'relative',
    display:      'flex',
    alignItems:   'center',
  },
  searchIcon: {
    position:      'absolute',
    left:          12,
    fontSize:      15,
    pointerEvents: 'none',
  },
  searchInput: {
    height:       36,
    padding:      '0 14px 0 36px',
    borderRadius: 9999,
    border:       '1.5px solid rgba(200,196,220,0.30)',
    background:   'rgba(248,247,255,0.8)',
    fontFamily:   "'Nunito', sans-serif",
    fontSize:     '0.84rem',
    fontWeight:   500,
    color:        '#1A1830',
    outline:      'none',
    width:        200,
  },
  filters: {
    display:    'flex',
    gap:        8,
    padding:    '12px 22px',
    flexWrap:   'wrap',
  },
  filterBtn: {
    display:      'flex',
    alignItems:   'center',
    gap:          6,
    padding:      '6px 14px',
    borderRadius: 9999,
    fontSize:     '0.80rem',
    fontWeight:   700,
    fontFamily:   "'Nunito', sans-serif",
    cursor:       'pointer',
    transition:   'all 200ms ease',
  },
  filterCount: {
    fontSize:     '0.72rem',
    fontWeight:   800,
    padding:      '1px 6px',
    borderRadius: 9999,
    minWidth:     18,
    textAlign:    'center',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width:          '100%',
    borderCollapse: 'collapse',
  },
  th: {
    fontFamily:    "'Nunito', sans-serif",
    fontSize:      '0.74rem',
    fontWeight:    800,
    color:         '#9E99B8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding:       '10px 16px',
    textAlign:     'left',
    background:    'rgba(248,247,255,0.6)',
    borderBottom:  '1px solid rgba(200,196,220,0.15)',
    whiteSpace:    'nowrap',
  },
  tr: {
    borderBottom: '1px solid rgba(200,196,220,0.10)',
    transition:   'background 150ms ease',
  },
  td: {
    padding: '12px 16px',
    verticalAlign: 'middle',
  },
  studentCell: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
  },
  avatar: {
    width:          34,
    height:         34,
    borderRadius:   10,
    background:     '#F3F0FF',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  studentName: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.86rem',
    fontWeight: 700,
    color:      '#1A1830',
    whiteSpace: 'nowrap',
  },
  profileBadge: {
    fontSize:     '0.72rem',
    fontWeight:   800,
    padding:      '3px 10px',
    borderRadius: 9999,
    whiteSpace:   'nowrap',
  },
  noBadge: {
    color:    '#C8C4DC',
    fontSize: '0.80rem',
  },
  scoreCell: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    minWidth:   100,
  },
  scoreBar: {
    flex:         1,
    height:       5,
    background:   '#F0EEF8',
    borderRadius: 9999,
    overflow:     'hidden',
  },
  scoreFill: {
    height:       '100%',
    borderRadius: 9999,
    transition:   'width 600ms ease',
  },
  scoreNum: {
    fontFamily: "'Baloo 2', cursive",
    fontSize:   '0.85rem',
    fontWeight: 800,
    minWidth:   24,
    textAlign:  'right',
  },
  trendBadge: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.78rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display:      'inline-flex',
    alignItems:   'center',
    gap:          5,
    fontSize:     '0.76rem',
    fontWeight:   800,
    padding:      '4px 10px',
    borderRadius: 9999,
    whiteSpace:   'nowrap',
  },
  statusDot: {
    width:        6,
    height:       6,
    borderRadius: '50%',
    flexShrink:   0,
  },
  lastSeen: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.78rem',
    fontWeight: 600,
    color:      '#9E99B8',
    whiteSpace: 'nowrap',
  },
  empty: {
    padding:        40,
    textAlign:      'center',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            12,
  },
  emptyText: {
    fontFamily: "'Nunito', sans-serif",
    fontSize:   '0.88rem',
    fontWeight: 500,
    color:      '#9E99B8',
  },
}

export default StudentList