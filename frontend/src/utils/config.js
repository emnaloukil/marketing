export const TREND_CONFIG = {
  improving:   { labelFr: 'En amélioration', background: '#EAF3DE', border: '#639922', text: '#27500A', arrow: '↑' },
  stable_good: { labelFr: 'Stable et engagé', background: '#E6F1FB', border: '#378ADD', text: '#0C447C', arrow: '→' },
  stable_bad:  { labelFr: 'Stagnation',        background: '#FAEEDA', border: '#EF9F27', text: '#633806', arrow: '→' },
  degrading:   { labelFr: 'Dégradation',       background: '#FCEBEB', border: '#E24B4A', text: '#791F1F', arrow: '↓' },
  recovering:  { labelFr: 'Récupération',      background: '#EEEDFE', border: '#7F77DD', text: '#3C3489', arrow: '↗' },
}

export const BUTTON_CONFIG = {
  understand:  { label: 'Understand',  color: '#639922', background: '#EAF3DE', border: '#639922', text: '#27500A' },
  confused:    { label: 'Confused',    color: '#378ADD', background: '#E6F1FB', border: '#378ADD', text: '#0C447C' },
  overwhelmed: { label: 'Overwhelmed', color: '#EF9F27', background: '#FAEEDA', border: '#EF9F27', text: '#633806' },
  help:        { label: 'Help',        color: '#E24B4A', background: '#FCEBEB', border: '#E24B4A', text: '#791F1F' },
}

export const REC_CONFIG = {
  pedagogique:   { background: '#E6F1FB', border: '#378ADD', text: '#0C447C' },
  urgent:        { background: '#FCEBEB', border: '#E24B4A', text: '#791F1F' },
  difficulte:    { background: '#FAEEDA', border: '#EF9F27', text: '#633806' },
  emotionnelle:  { background: '#EEEDFE', border: '#7F77DD', text: '#3C3489' },
  encouragement: { background: '#EAF3DE', border: '#639922', text: '#27500A' },
  approche:      { background: '#E1F5EE', border: '#1D9E75', text: '#085041' },
}

export const DAY_TREND_CONFIG = {
  good:       { label: 'Bonne journée',     background: '#EAF3DE', border: '#639922', text: '#27500A', emoji: '📈' },
  moderate:   { label: 'Journée modérée',  background: '#FAEEDA', border: '#EF9F27', text: '#633806', emoji: '📊' },
  struggling: { label: 'Journée difficile', background: '#FCEBEB', border: '#E24B4A', text: '#791F1F', emoji: '📉' },
}