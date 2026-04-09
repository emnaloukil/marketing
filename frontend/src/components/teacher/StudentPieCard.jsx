import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { BUTTON_CONFIG } from '../../utils/config'

// ─────────────────────────────────────────
// StudentPieCard
// Shows one student's button distribution as pie chart
// ─────────────────────────────────────────
const StudentPieCard = ({ student }) => {
  const { studentName, counts, totalPresses, engagementScore, trend } = student

  // Format counts for pie chart
  const data = Object.entries(counts)
    .filter(([, val]) => val > 0)
    .map(([key, val]) => ({
      name:  BUTTON_CONFIG[key].label,
      value: val,
      color: BUTTON_CONFIG[key].color
    }))

  // Student initials for avatar
  const initials = studentName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Score color
  const scoreColor = !engagementScore   ? '#888780'
    : engagementScore >= 65             ? '#639922'
    : engagementScore >= 40             ? '#EF9F27'
    : '#E24B4A'

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white', border: '0.5px solid rgba(0,0,0,0.1)',
          borderRadius: 8, padding: '4px 8px', fontSize: 12
        }}>
          <span style={{ color: payload[0].payload.color, fontWeight: 500 }}>
            {payload[0].name}: {payload[0].value}
          </span>
        </div>
      )
    }
    return null
  }

  return (
    <div style={styles.wrapper}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>{initials}</div>
        <div style={styles.info}>
          <div style={styles.name}>{studentName}</div>
          <div style={{ fontSize: 12, color: scoreColor, fontWeight: 500 }}>
            Score: {engagementScore !== null ? engagementScore : '—'}
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#888780' }}>
          {totalPresses} presses
        </div>
      </div>

      {/* Pie chart */}
      {totalPresses === 0 ? (
        <div style={styles.empty}>No data yet</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={styles.legend}>
            {Object.entries(counts).map(([key, val]) => (
              <div key={key} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: BUTTON_CONFIG[key].color }} />
                <span style={styles.legendLabel}>{BUTTON_CONFIG[key].label}</span>
                <span style={styles.legendCount}>{val}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    background:   'white',
    border:       '0.5px solid rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding:      '14px 16px'
  },
  header: {
    display:    'flex',
    alignItems: 'center',
    gap:        10,
    marginBottom: 8
  },
  avatar: {
    width:          34,
    height:         34,
    borderRadius:   '50%',
    background:     '#EEEDFE',
    color:          '#3C3489',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       12,
    fontWeight:     500,
    flexShrink:     0
  },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: 500, color: '#2C2C2A' },
  empty: {
    fontSize:  12,
    color:     '#888780',
    fontStyle: 'italic',
    textAlign: 'center',
    padding:   '30px 0'
  },
  legend: {
    display:       'flex',
    flexDirection: 'column',
    gap:           4,
    marginTop:     4
  },
  legendItem: {
    display:    'flex',
    alignItems: 'center',
    gap:        6
  },
  legendDot: {
    width:        8,
    height:       8,
    borderRadius: '50%',
    flexShrink:   0
  },
  legendLabel: {
    fontSize: 11,
    color:    '#888780',
    flex:     1
  },
  legendCount: {
    fontSize:   12,
    fontWeight: 500,
    color:      '#2C2C2A'
  }
}

export default StudentPieCard