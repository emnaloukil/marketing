import React from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'

// ─────────────────────────────────────────
// TrendChart
// Line chart showing class engagement over time
// ─────────────────────────────────────────
const TrendChart = ({ classHistory, trend }) => {

  // Format history for recharts
  const data = classHistory.map((score, i) => ({
    press: i + 1,
    score
  }))

  // Line color based on trend
  const lineColor = !trend               ? '#888780'
    : trend === 'improving'              ? '#639922'
    : trend === 'stable_good'            ? '#378ADD'
    : trend === 'recovering'             ? '#7F77DD'
    : trend === 'degrading'              ? '#E24B4A'
    : '#EF9F27'

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background:   'white',
          border:       '0.5px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          padding:      '6px 10px',
          fontSize:     12
        }}>
          <div style={{ color: '#888780' }}>Press #{payload[0].payload.press}</div>
          <div style={{ fontWeight: 500, color: lineColor }}>
            Score: {payload[0].value}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>Class engagement trend</span>
        <div style={styles.legend}>
          <span style={styles.legendDot(lineColor)} />
          <span style={{ fontSize: 12, color: '#888780' }}>Engagement score</span>
          <span style={{ ...styles.legendDash, marginLeft: 12 }} />
          <span style={{ fontSize: 12, color: '#888780' }}>Neutral (50)</span>
        </div>
      </div>

      {data.length < 2 ? (
        <div style={styles.waiting}>
          Waiting for button presses to draw the trend...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="press"
              tick={{ fontSize: 11, fill: '#888780' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Presses', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: '#888780' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#888780' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={50}
              stroke="rgba(0,0,0,0.15)"
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

const styles = {
  wrapper: {
    background:   'white',
    border:       '0.5px solid rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding:      '16px 20px',
    marginBottom: 16
  },
  header: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   14,
    flexWrap:       'wrap',
    gap:            8
  },
  title: {
    fontSize:   13,
    fontWeight: 500,
    color:      '#888780'
  },
  legend: {
    display:    'flex',
    alignItems: 'center',
    gap:        6
  },
  legendDot: (color) => ({
    width:        10,
    height:       10,
    borderRadius: 50,
    background:   color,
    display:      'inline-block'
  }),
  legendDash: {
    width:           20,
    height:          0,
    borderTop:       '1.5px dashed rgba(0,0,0,0.2)',
    display:         'inline-block',
    verticalAlign:   'middle'
  },
  waiting: {
    fontSize:  13,
    color:     '#888780',
    fontStyle: 'italic',
    padding:   '30px 0',
    textAlign: 'center'
  }
}

export default TrendChart