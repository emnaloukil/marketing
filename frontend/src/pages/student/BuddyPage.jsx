import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/student/Header'
import ChatbotFAB from '../../components/student/Chatbotfab'

const API_BASE = 'http://localhost:8000'

const QUICK_REPLIES = [
  { text: 'I had a great day! 😊' },
  { text: 'I feel confused 😟' },
  { text: 'School was fun! 🎉' },
  { text: 'I need help 🙋' },
]

const BunnyAvatar = ({ size = 44, speaking = false }) => (
  <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
    {speaking && (
      <div style={{ position:'absolute', inset:-5, borderRadius:'50%', border:'3px solid #a78bfa', animation:'speakRing 1s ease-in-out infinite', opacity:0.6 }}/>
    )}
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="40" fill="#F3F0FF"/>
      <ellipse cx="27" cy="18" rx="7" ry="14" fill="#E2D9F3"/>
      <ellipse cx="53" cy="18" rx="7" ry="14" fill="#E2D9F3"/>
      <ellipse cx="27" cy="18" rx="4" ry="10" fill="#FFB3C6"/>
      <ellipse cx="53" cy="18" rx="4" ry="10" fill="#FFB3C6"/>
      <circle cx="40" cy="44" r="22" fill="white"/>
      <circle cx="33" cy="40" r="3" fill="#333"/>
      <circle cx="47" cy="40" r="3" fill="#333"/>
      <circle cx="34" cy="39" r="1" fill="white"/>
      <circle cx="48" cy="39" r="1" fill="white"/>
      <circle cx="28" cy="46" r="4" fill="#FFB3C6" opacity="0.5"/>
      <circle cx="52" cy="46" r="4" fill="#FFB3C6" opacity="0.5"/>
      <ellipse cx="40" cy="47" rx="2" ry="1.5" fill="#FFB3C6"/>
      {speaking
        ? <ellipse cx="40" cy="51" rx="4" ry="3" fill="#FFB3C6"/>
        : <path d="M37 50 Q40 53 43 50" stroke="#aaa" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      }
    </svg>
  </div>
)

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)

function Message({ msg, speaking }) {
  const isUser = msg.role === 'user'
  const isAr = /[\u0600-\u06FF]/.test(msg.content)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:10, justifyContent: isUser ? 'flex-end' : 'flex-start', animation:'fadeUp 0.22s ease' }}>
      {!isUser && <BunnyAvatar size={36} speaking={speaking}/>}
      <div style={{
        maxWidth:'65%',
        padding:'13px 18px',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        fontSize:15,
        lineHeight:1.6,
        fontWeight:600,
        background: isUser ? 'linear-gradient(135deg,#a78bfa,#7c3aed)' : '#F0EDFF',
        color: isUser ? 'white' : '#2D2D4E',
        boxShadow: isUser ? '0 4px 14px rgba(124,58,237,0.22)' : '0 2px 6px rgba(0,0,0,0.04)',
        direction: isAr ? 'rtl' : 'ltr',
        textAlign: isAr ? 'right' : 'left',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
      <BunnyAvatar size={36}/>
      <div style={{ background:'#F0EDFF', padding:'13px 18px', borderRadius:'20px 20px 20px 4px', display:'flex', gap:5, alignItems:'center' }}>
        {[0,160,320].map(d => (
          <span key={d} style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'#a78bfa', animation:`bounce 1.2s ${d}ms infinite` }}/>
        ))}
      </div>
    </div>
  )
}

export default function BuddyPage({ studentName = 'Luna Martinez' }) {
  const [messages, setMessages] = useState([
    { role:'assistant', content:`Hi ${studentName}! I'm Cloud Bunny 🐰. How was your day today?`, audio:null }
  ])
  const [input, setInput]         = useState('')
  const [language, setLanguage]   = useState('auto')
  const [loading, setLoading]     = useState(false)
  const [recording, setRecording] = useState(false)
  const [speaking, setSpeaking]   = useState(false)
  const [error, setError]         = useState(null)
  const navigate = useNavigate()

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const mediaRef  = useRef(null)
  const chunksRef = useRef([])
  const audioRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, loading])

  const history = () => messages.map(m => ({ role:m.role, content:m.content }))

  const playAudio = (audioPath) => {
    if (!audioPath) return
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const audio = new Audio(`${API_BASE}/audio/${audioPath}`)
    audioRef.current = audio
    setSpeaking(true)
    audio.play().catch(() => setSpeaking(false))
    audio.onended = () => setSpeaking(false)
    audio.onerror = () => setSpeaking(false)
  }

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    setError(null)
    setInput('')
    setMessages(prev => [...prev, { role:'user', content:text, audio:null }])
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message:text, language, history:history() }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail) }
      const data = await res.json()
      setMessages(prev => [...prev, { role:'assistant', content:data.reply, audio:data.audio||null }])
      if (data.audio) playAudio(data.audio)
    } catch {
      setError("Oops! Cloud Bunny had a hiccup 🐰 Try again?")
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const startRecording = async () => {
    setError(null)
    if (audioRef.current) { audioRef.current.pause(); setSpeaking(false) }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type:'audio/webm' })
        await transcribeAndSend(blob)
      }
      mr.start()
      setRecording(true)
    } catch { setError('Microphone access denied.') }
  }

  const stopRecording = () => { mediaRef.current?.stop(); setRecording(false) }

  const transcribeAndSend = async (blob) => {
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', blob, 'audio.webm')
      const res = await fetch(`${API_BASE}/transcribe?language=${language}`, { method:'POST', body:form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail) }
      const data = await res.json()
      if (data.transcript) await sendMessage(data.transcript)
    } catch {
      setError("Couldn't understand that 🐰 Try again?")
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const lastBotIdx = messages.reduce((acc, m, i) => m.role === 'assistant' ? i : acc, -1)

  return (
    <div style={s.page}>
      <Header />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce    { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes speakRing { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.18);opacity:0.15} }
        .quick-btn:hover  { background:#EDE9FE !important; border-color:#a78bfa !important; transform:translateY(-1px); }
        .send-btn:hover:not(:disabled) { filter:brightness(1.08); }
        .mic-btn:hover:not(:disabled)  { background:#EDE9FE !important; }
        input:focus { outline:none; border-color:#a78bfa !important; box-shadow:0 0 0 3px rgba(167,139,250,0.15); }
        input::placeholder { color:#C4BFDB; font-family:'Nunito',sans-serif; font-weight:600; }
        .lang-btn:hover { background:rgba(167,139,250,0.12) !important; }
      `}</style>

      {/* Top header bar */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.headerLeft}>
            <div style={s.avatarCircle}><BunnyAvatar size={44}/></div>
            <div>
              <div style={s.greetTop}>Hey there! 👋</div>
              <div style={s.greetName}>{studentName}</div>
            </div>
          </div>
          <div style={s.levelWrap}>
            <span style={s.levelLabel}>Level 5</span>
            <div style={s.xpBg}><div style={s.xpFill}/></div>
          </div>
          <button style={s.backBtn} onClick={() => navigate(-1)} title="Back to previous page">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span style={s.backLabel}>Back</span>
          </button>
        </div>
        <div style={s.headerWave}/>
      </div>

      {/* Main content — 2 columns on desktop */}
      <div style={s.content}>

        {/* LEFT — Cloud Bunny info panel */}
        <div style={s.sidebar}>
          <div style={s.sideCard}>
            <div style={s.bunnyWrap}>
              <BunnyAvatar size={90} speaking={speaking}/>
            </div>
            <div style={s.buddyName}>Cloud Bunny</div>
            <div style={s.buddyStatus}>
              <span style={s.onlineDot}/>
              <span style={s.onlineText}>{speaking ? '🔊 Speaking...' : 'Online'}</span>
            </div>
            <div style={s.buddyDesc}>Your emotional buddy 🌈</div>

            <div style={s.divider}/>

            {/* Language selector */}
            <div style={s.langTitle}>Language</div>
            <div style={s.langBtns}>
              {[
                { code:'auto', label:'🌍 Auto' },
                { code:'ar',   label:'🇸🇦 عربي' },
                { code:'fr',   label:'🇫🇷 FR' },
                { code:'en',   label:'🇬🇧 EN' },
              ].map(l => (
                <button key={l.code} className="lang-btn"
                  style={{ ...s.langBtn, ...(language === l.code ? s.langBtnActive : {}) }}
                  onClick={() => setLanguage(l.code)}>
                  {l.label}
                </button>
              ))}
            </div>

            <div style={s.divider}/>

            {/* Quick replies */}
            <div style={s.langTitle}>Quick replies</div>
            <div style={s.quickList}>
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} className="quick-btn" style={s.quickBtn}
                  onClick={() => sendMessage(q.text)} disabled={loading || recording}>
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Chat area */}
        <div style={s.chatWrap}>
          <div style={s.chatCard}>

            {/* Chat header */}
            <div style={s.chatHeader}>
              <BunnyAvatar size={38} speaking={speaking}/>
              <div>
                <div style={s.chatHeaderName}>Cloud Bunny</div>
                <div style={s.chatHeaderSub}>
                  {speaking ? '🔊 Speaking...' : 'Online • Your emotional buddy'}
                </div>
              </div>
            </div>
            <div style={s.chatDivider}/>

            {/* Messages */}
            <div style={s.messages}>
              {messages.map((m, i) => (
                <Message key={i} msg={m} speaking={speaking && i === lastBotIdx}/>
              ))}
              {loading && <TypingDots/>}
              {error && <div style={s.errorBox}>{error}</div>}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div style={s.inputArea}>
              <div style={s.inputRow}>
                <button className="mic-btn"
                  style={{ ...s.micBtn, ...(recording ? s.micBtnActive : {}) }}
                  onClick={recording ? stopRecording : startRecording}
                  disabled={loading}
                  title={recording ? 'Stop recording' : 'Speak'}
                >
                  {recording
                    ? <span style={{ display:'block', width:10, height:10, borderRadius:'50%', background:'#e53e3e', animation:'pulse 1s infinite' }}/>
                    : <MicIcon/>
                  }
                </button>

                <input
                  ref={inputRef}
                  style={s.input}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={recording ? 'Listening...' : 'Talk to Cloud Bunny...'}
                  disabled={loading || recording}
                />

                <button className="send-btn"
                  style={{ ...s.sendBtn, opacity:(!input.trim()||loading) ? 0.4 : 1 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                >
                  <SendIcon/>
                </button>
              </div>

              {recording && (
                <div style={s.recBar}>
                  <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:'#e53e3e', animation:'pulse 1s infinite' }}/>
                  Recording... click mic to stop
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <ChatbotFAB />
    </div>
  )
}

const s = {
  page:           { fontFamily:"'Nunito',sans-serif", minHeight:'100vh', background:'#FDF8EE', display:'flex', flexDirection:'column', paddingTop: 'calc(var(--header-height) + 16px)' },
  header:         { background:'linear-gradient(135deg,#3B82F6 0%,#06B6D4 100%)', position:'relative', flexShrink:0 },
  headerInner:    { display:'flex', alignItems:'center', gap:16, padding:'20px 40px 52px', maxWidth:1200, margin:'0 auto', width:'100%' },
  headerWave:     { position:'absolute', bottom:-1, left:0, right:0, height:36, background:'#FDF8EE', borderTopLeftRadius:'50% 100%', borderTopRightRadius:'50% 100%' },
  headerLeft:     { display:'flex', alignItems:'center', gap:14, flex:1 },
  avatarCircle:   { width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', border:'2.5px solid rgba(255,255,255,0.5)', flexShrink:0 },
  greetTop:       { fontSize:13, color:'rgba(255,255,255,0.85)', fontWeight:600 },
  greetName:      { fontSize:22, fontWeight:900, color:'white', letterSpacing:'-0.3px' },
  levelWrap:      { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 },
  levelLabel:     { fontSize:13, fontWeight:700, color:'white' },
  xpBg:           { width:100, height:9, borderRadius:99, background:'rgba(255,255,255,0.3)', overflow:'hidden' },
  xpFill:         { width:'68%', height:'100%', borderRadius:99, background:'#FACC15' },
  backBtn:        { display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.22)', border:'1px solid rgba(255,255,255,0.35)', color:'white', borderRadius:999, padding:'10px 16px', cursor:'pointer', fontWeight:700, fontSize:13, transition:'all 0.2s' },
  backLabel:      { fontSize:13, fontWeight:700, color:'white' },

  content:        { flex:1, display:'flex', gap:24, padding:'32px 40px 40px', maxWidth:1200, margin:'0 auto', width:'100%' },

  /* LEFT sidebar */
  sidebar:        { width:260, flexShrink:0 },
  sideCard:       { background:'white', borderRadius:24, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'28px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, position:'sticky', top:24 },
  bunnyWrap:      { marginBottom:4 },
  buddyName:      { fontSize:20, fontWeight:900, color:'#1E1B4B' },
  buddyStatus:    { display:'flex', alignItems:'center', gap:6 },
  onlineDot:      { display:'inline-block', width:9, height:9, borderRadius:'50%', background:'#22C55E' },
  onlineText:     { fontSize:13, fontWeight:700, color:'#22C55E' },
  buddyDesc:      { fontSize:13, color:'#9580c0', fontWeight:600 },
  divider:        { width:'100%', height:1, background:'#F1F5F9', margin:'6px 0' },
  langTitle:      { fontSize:12, fontWeight:800, color:'#b0a8cc', textTransform:'uppercase', letterSpacing:'0.5px', alignSelf:'flex-start' },
  langBtns:       { display:'flex', flexWrap:'wrap', gap:6, width:'100%' },
  langBtn:        { flex:1, minWidth:60, padding:'7px 10px', borderRadius:12, border:'1.5px solid #E8E4F7', background:'transparent', color:'#7c6fa0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif", transition:'all 0.15s', textAlign:'center' },
  langBtnActive:  { background:'rgba(167,139,250,0.15)', borderColor:'#a78bfa', color:'#6d28d9' },
  quickList:      { display:'flex', flexDirection:'column', gap:7, width:'100%' },
  quickBtn:       { padding:'10px 14px', borderRadius:14, border:'1.5px solid #E8E4F7', background:'white', fontSize:13, fontWeight:700, color:'#4B3F8A', cursor:'pointer', fontFamily:"'Nunito',sans-serif", transition:'all 0.15s', textAlign:'left' },

  /* RIGHT chat */
  chatWrap:       { flex:1, display:'flex', flexDirection:'column', minWidth:0 },
  chatCard:       { background:'white', borderRadius:24, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', display:'flex', flexDirection:'column', flex:1, overflow:'hidden', minHeight:0, height:'calc(100vh - 200px)' },
  chatHeader:     { display:'flex', alignItems:'center', gap:14, padding:'18px 24px 14px' },
  chatHeaderName: { fontSize:17, fontWeight:900, color:'#1E1B4B' },
  chatHeaderSub:  { fontSize:13, fontWeight:600, color:'#22C55E', marginTop:2 },
  chatDivider:    { height:1, background:'#F1F5F9', margin:'0 24px' },
  messages:       { flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 },
  errorBox:       { background:'#FFF0F0', border:'1px solid #FFD0D0', color:'#C0392B', borderRadius:12, padding:'10px 16px', fontSize:13, fontWeight:600 },
  inputArea:      { borderTop:'1px solid #F1F5F9', padding:'14px 20px 16px' },
  inputRow:       { display:'flex', alignItems:'center', gap:10 },
  micBtn:         { width:46, height:46, borderRadius:'50%', border:'1.5px solid #E8E4F7', background:'#FAF9FF', color:'#7c6fa0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' },
  micBtnActive:   { background:'rgba(255,80,80,0.1)', borderColor:'rgba(255,80,80,0.4)', color:'#e53e3e' },
  input:          { flex:1, height:50, borderRadius:25, border:'1.5px solid #E8E4F7', background:'#FAF9FF', padding:'0 20px', fontSize:15, fontFamily:"'Nunito',sans-serif", fontWeight:600, color:'#2D2D4E', transition:'border-color 0.15s, box-shadow 0.15s' },
  sendBtn:        { width:50, height:50, borderRadius:'50%', background:'linear-gradient(135deg,#a78bfa,#7c3aed)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(124,58,237,0.35)', transition:'filter 0.15s, opacity 0.15s' },
  recBar:         { display:'flex', alignItems:'center', gap:7, marginTop:8, fontSize:12, color:'#e53e3e', fontWeight:700, fontFamily:"'Nunito',sans-serif" },
}
