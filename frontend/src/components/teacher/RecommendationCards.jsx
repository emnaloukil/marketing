import React from 'react'
import { REC_CONFIG } from '../../utils/config'

const RecommendationCards = ({ recommendations, trend }) => {

  if (!trend) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.sectionLabel}>Recommendations</div>
        <div style={styles.waiting}>
          Waiting for enough data to generate recommendations...
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.sectionLabel}>
        Recommendations — based on class trend
      </div>
      <div style={styles.cards}>
        {recommendations.map((rec, i) => {
          const cfg = REC_CONFIG[rec.type] || REC_CONFIG['pedagogique']
          return (
            <div
              key={i}
              style={{
                ...styles.card,
                background:  cfg.background,
                borderColor: cfg.border
              }}
            >
              <div style={{ ...styles.cardType, color: cfg.border }}>
                {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
              </div>
              <div style={{ ...styles.cardMessage, color: cfg.text }}>
                {rec.message}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  wrapper:      { marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: 500, color: '#888780', marginBottom: 10 },
  waiting:      { fontSize: 13, color: '#888780', fontStyle: 'italic' },
  cards:        { display: 'flex', flexDirection: 'column', gap: 8 },
  card:         { borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid' },
  cardType:     { fontSize: 11, fontWeight: 500, marginBottom: 4 },
  cardMessage:  { fontSize: 13, lineHeight: 1.6 }
}

export default RecommendationCards