import React from 'react'
import useDashboard from '../../hooks/useDashboard'
import { BUTTON_CONFIG, DAY_TREND_CONFIG } from '../../utils/config'
import ChatWidget from '../shared/ChatWidget'

const SessionRow = ({ session }) => {
  const color = !session.score ? '#888780' : session.score >= 65 ? '#639922' : session.score >= 40 ? '#EF9F27' : '#E24B4A'
  const bg    = !session.score ? '#F1EFE8' : session.score >= 65 ? '#EAF3DE' : session.score >= 40 ? '#FAEEDA' : '#FCEBEB'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#F5F4EF', borderRadius:8, marginBottom:6 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
      <div style={{ flex:1, fontSize:13, color:'#2C2C2A', fontWeight:500 }}>{session.subject}</div>
      <div style={{ fontSize:12, color:'#888780' }}>{session.time}</div>
      <span style={{ fontSize:11, fontWeight:500, padding:'2px 9px', borderRadius:99, background:bg, color }}>
        {session.score !== null ? `${session.score}/100` : 'En attente'}
      </span>
    </div>
  )
}

const ButtonSummary = ({ counts, totalPresses }) => {
  if (totalPresses === 0) return (
    <div style={{ fontSize:13, color:'#888780', fontStyle:'italic', marginBottom:12 }}>Pas encore de données...</div>
  )
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:10, padding:'10px 12px', background:'#F5F4EF', borderRadius:8, marginBottom:12 }}>
      {Object.entries(counts).map(([key, val]) => {
        const cfg = BUTTON_CONFIG[key]
        return (
          <div key={key} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.color }} />
            <span style={{ fontSize:12, color:'#888780' }}>{cfg.label}</span>
            <span style={{ fontSize:12, fontWeight:500, padding:'1px 7px', borderRadius:99, background:cfg.background, color:cfg.text }}>{val}x</span>
          </div>
        )
      })}
    </div>
  )
}

const ChildCard = ({ student }) => {
  const { studentName, daySummary, counts, totalPresses } = student
  const { sessions, dayTrend, avgScore } = daySummary
  const initials   = studentName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const cfg        = dayTrend ? DAY_TREND_CONFIG[dayTrend] : null
  const scoreColor = !avgScore ? '#888780' : avgScore >= 65 ? '#639922' : avgScore >= 40 ? '#EF9F27' : '#E24B4A'
  const advice     = !dayTrend ? null
    : dayTrend === 'good'     ? `${studentName} a eu une bonne journée. Demandez-lui ce qu'il a appris — ça renforce sa confiance.`
    : dayTrend === 'moderate' ? `${studentName} a eu quelques difficultés. Encouragez-le et évitez les révisions ce soir.`
    :                           `${studentName} a eu une journée difficile. Offrez-lui du repos et du soutien émotionnel ce soir.`

  return (
    <div style={{ background:'white', border:'0.5px solid rgba(0,0,0,0.1)', borderRadius:14, padding:'18px 20px', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'#EEEDFE', color:'#3C3489', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:500, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:500, color:'#2C2C2A' }}>{studentName}</div>
          <div style={{ fontSize:12, color:scoreColor, fontWeight:500, marginTop:2 }}>
            Score moyen : {avgScore !== null ? `${avgScore}/100` : '—'}
          </div>
        </div>
        {cfg
          ? <span style={{ fontSize:12, fontWeight:500, padding:'4px 12px', borderRadius:99, background:cfg.background, color:cfg.text, border:`0.5px solid ${cfg.border}` }}>
              {cfg.emoji} {cfg.label}
            </span>
          : <span style={{ fontSize:12, color:'#888780', fontStyle:'italic' }}>En attente...</span>
        }
      </div>

      <div style={{ fontSize:12, fontWeight:500, color:'#888780', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Sessions du jour</div>
      {sessions.map((s, i) => <SessionRow key={i} session={s} />)}

      <div style={{ fontSize:12, fontWeight:500, color:'#888780', margin:'12px 0 8px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Boutons pressés aujourd'hui</div>
      <ButtonSummary counts={counts} totalPresses={totalPresses} />

      {advice && cfg && (
        <div style={{ borderRadius:8, padding:'12px 14px', borderLeft:'3px solid', background:cfg.background, borderColor:cfg.border }}>
          <div style={{ fontSize:11, fontWeight:500, color:cfg.border, marginBottom:4 }}>Conseil pour ce soir</div>
          <div style={{ fontSize:13, color:cfg.text, lineHeight:1.6 }}>{advice}</div>
        </div>
      )}
    </div>
  )
}

const ParentDashboard = ({ parentId = 'p1' }) => {
  const { students = [], parents = [], loading, connected } = useDashboard()
  const parent     = parents.length > 0 ? parents.find(p => p.parentId === parentId) : null
  const myChildren = students.filter(s => s.parentId === parentId)
  const today      = new Date().toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <div style={{ background:'#F5F4EF', minHeight:'100vh' }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'24px 16px' }}>

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:500, color:'#2C2C2A', margin:0 }}>Rapport journalier</h1>
            <div style={{ fontSize:13, color:'#888780', marginTop:4 }}>
              {parent ? `Bonjour, ${parent.parentName}` : 'Tableau de bord parent'}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:connected ? '#639922' : '#E24B4A' }} />
            <span style={{ fontSize:12, color:'#888780' }}>{connected ? 'En direct' : 'Connexion...'}</span>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'white', borderRadius:10, border:'0.5px solid rgba(0,0,0,0.08)', marginBottom:20 }}>
          <span style={{ fontSize:13, color:'#888780' }}>{today}</span>
          <span style={{ fontSize:12, fontWeight:500, padding:'3px 10px', borderRadius:99, background:'#EEEDFE', color:'#3C3489' }}>
            {myChildren.length} enfant{myChildren.length > 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div style={{ fontSize:14, color:'#888780', textAlign:'center', padding:'60px 0' }}>Chargement du rapport...</div>
        ) : myChildren.length === 0 ? (
          <div style={{ fontSize:14, color:'#888780', textAlign:'center', padding:'60px 0' }}>En attente des données...</div>
        ) : (
          myChildren.map(child => <ChildCard key={child.studentId} student={child} />)
        )}
      </div>

      {/* Floating chat */}
      <ChatWidget role="parent" />
    </div>
  )
}

export default ParentDashboard