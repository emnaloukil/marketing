import { TREND_CONFIG } from '../../utils/config'

// ─────────────────────────────────────────
// ClassScoreCard
// Shows class score + breakdown stats
// ─────────────────────────────────────────
const ClassScoreCard = ({ classScore, breakdown, trend }) => {
  const trendCfg = trend ? TREND_CONFIG[trend] : null

  return (
    <div style={styles.wrapper}>

      {/* Class score */}
      <div style={styles.scoreBox}>
        <div style={styles.scoreLabel}>Class engagement score</div>
        <div style={styles.scoreValue}>
          {classScore !== null ? classScore : '—'}
          {classScore !== null && <span style={styles.scoreMax}>/100</span>}
        </div>
        {trendCfg && (
          <span style={{
            ...styles.trendPill,
            background: trendCfg.background,
            color:      trendCfg.text,
            border:     `0.5px solid ${trendCfg.border}`
          }}>
            {trendCfg.arrow} {trendCfg.labelFr}
          </span>
        )}
        {!trendCfg && (
          <span style={styles.waitingPill}>Waiting for data...</span>
        )}
      </div>

      {/* Breakdown */}
      <div style={styles.breakdown}>
        <div style={styles.breakItem}>
          <div style={{ ...styles.breakNum, color: '#639922' }}>
            {breakdown.engaged}
          </div>
          <div style={styles.breakLabel}>Engaged</div>
          <div style={{ ...styles.breakDot, background: '#639922' }} />
        </div>
        <div style={styles.breakItem}>
          <div style={{ ...styles.breakNum, color: '#EF9F27' }}>
            {breakdown.struggling}
          </div>
          <div style={styles.breakLabel}>Struggling</div>
          <div style={{ ...styles.breakDot, background: '#EF9F27' }} />
        </div>
        <div style={styles.breakItem}>
          <div style={{ ...styles.breakNum, color: '#E24B4A' }}>
            {breakdown.distressed}
          </div>
          <div style={styles.breakLabel}>Distressed</div>
          <div style={{ ...styles.breakDot, background: '#E24B4A' }} />
        </div>
        <div style={styles.breakItem}>
          <div style={{ ...styles.breakNum, color: '#888780' }}>
            {breakdown.total}
          </div>
          <div style={styles.breakLabel}>Total</div>
          <div style={{ ...styles.breakDot, background: '#888780' }} />
        </div>
      </div>

    </div>
  )
}

const styles = {
  wrapper: {
    display:       'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:           12,
    marginBottom:  16
  },
  scoreBox: {
    background:   'white',
    border:       '0.5px solid rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding:      '16px 20px'
  },
  scoreLabel: {
    fontSize:    12,
    color:       '#888780',
    marginBottom: 6
  },
  scoreValue: {
    fontSize:    32,
    fontWeight:  500,
    color:       '#2C2C2A',
    marginBottom: 10,
    lineHeight:  1
  },
  scoreMax: {
    fontSize:   16,
    color:      '#888780',
    fontWeight: 400,
    marginLeft:  4
  },
  trendPill: {
    display:      'inline-block',
    fontSize:     12,
    fontWeight:   500,
    padding:      '3px 10px',
    borderRadius: 99
  },
  waitingPill: {
    display:      'inline-block',
    fontSize:     12,
    color:        '#888780',
    fontStyle:    'italic'
  },
  breakdown: {
    background:   'white',
    border:       '0.5px solid rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding:      '16px 20px',
    display:      'grid',
    gridTemplateColumns: '1fr 1fr',
    gap:          12
  },
  breakItem: {
    display:       'flex',
    flexDirection: 'column',
    gap:           2
  },
  breakNum: {
    fontSize:   22,
    fontWeight: 500
  },
  breakLabel: {
    fontSize: 12,
    color:    '#888780'
  },
  breakDot: {
    width:        20,
    height:       3,
    borderRadius: 2,
    marginTop:    4
  }
}

export default ClassScoreCard