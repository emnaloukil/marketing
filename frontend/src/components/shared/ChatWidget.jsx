import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

// ─────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────
const TEACHERS = [
  { id: 't1', name: 'Mr. Hamdi', subject: 'Mathematics' },
  { id: 't2', name: 'Mrs. Slama', subject: 'Reading' },
  { id: 't3', name: 'Mr. Belhaj', subject: 'Sciences' },
]

const PARENTS_LIST = [
  { id: 'p1', name: 'Mr. Ben Ali', children: 'Amine, Sara' },
  { id: 'p2', name: 'Mrs. Trabelsi', children: 'Youssef, Omar' },
  { id: 'p3', name: 'Mr. Mansouri', children: 'Lina' },
  { id: 'p4', name: 'Mrs. Chaabane', children: 'Nour' },
]

const INITIAL_CONVERSATIONS = {
  p1: [
    {
      id: 1,
      from: 'parent',
      text: "Bonjour, Amine a eu du mal à dormir cette semaine. Est-ce que ça affecte son comportement en classe ?",
      time: '08:12',
      read: false
    },
  ],
  p2: [
    {
      id: 2,
      from: 'parent',
      text: "Bonsoir, Youssef me dit qu'il ne comprend pas les maths. Pouvez-vous m'expliquer où il bloque ?",
      time: '17:45',
      read: false
    },
    {
      id: 3,
      from: 'parent',
      text: "Omar a bien travaillé à la maison hier soir.",
      time: '18:02',
      read: false
    },
  ],
  p3: [],
  p4: [
    {
      id: 4,
      from: 'parent',
      text: "Nour adore les sciences ! Elle m'a parlé de la leçon sur les plantes.",
      time: '16:30',
      read: true
    },
  ],
}

const TEACHER_REPLIES = {
  p1: [
    "Merci pour l'information. Je vais être attentif à Amine aujourd'hui.",
    "C'est vrai qu'il était un peu distrait ce matin. Le repos est important.",
    "Je vous tiendrai informé de son évolution."
  ],
  p2: [
    "Youssef bloque sur les fractions. Je vais lui donner des exercices visuels.",
    "Omar progresse bien, continuez à l'encourager.",
    "Je propose qu'on fasse un suivi hebdomadaire."
  ],
  p3: [
    "Bonjour, Lina se comporte très bien en classe.",
    "Elle est très attentive et participe activement.",
    "Continuez comme ça, elle est sur la bonne voie."
  ],
  p4: [
    "Nour est une élève brillante !",
    "Je suis ravie qu'elle partage les leçons à la maison.",
    "La prochaine leçon sera sur les animaux, elle va adorer."
  ],
}

// ─────────────────────────────────────────
// ChatWidget
// role = 'teacher' | 'parent'
// ─────────────────────────────────────────
const ChatWidget = ({ role = 'parent' }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [convs, setConvs] = useState(INITIAL_CONVERSATIONS)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  const list = role === 'parent' ? TEACHERS : PARENTS_LIST
  const messages = selected ? (convs[selected.id] || []) : []

  const unreadCount = Object.values(convs)
    .flat()
    .filter(m =>
      role === 'teacher'
        ? (!m.read && m.from === 'parent')
        : (!m.read && m.from === 'teacher')
    ).length

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, typing, open])

  useEffect(() => {
    if (!selected || !open) return

    setConvs(prev => ({
      ...prev,
      [selected.id]: (prev[selected.id] || []).map(m => ({ ...m, read: true }))
    }))
  }, [selected, open])

  const sendMessage = () => {
    if (!input.trim() || !selected) return

    const msg = {
      id: Date.now(),
      from: role,
      text: input.trim(),
      time: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      read: true,
    }

    setConvs(prev => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), msg]
    }))

    setInput('')
    setTyping(true)

    const replies = role === 'parent'
      ? [
          "Je vous réponds dès que possible.",
          "Merci pour votre message.",
          "Je prends note et reviendrai vers vous."
        ]
      : (TEACHER_REPLIES[selected.id] || ["Merci pour votre message."])

    setTimeout(() => {
      setTyping(false)
      setConvs(prev => ({
        ...prev,
        [selected.id]: [
          ...(prev[selected.id] || []),
          {
            id: Date.now() + 1,
            from: role === 'parent' ? 'teacher' : 'parent',
            text: replies[Math.floor(Math.random() * replies.length)],
            time: new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            read: true,
          }
        ]
      }))
    }, 1500)
  }

  const getUnread = id =>
    (convs[id] || []).filter(m =>
      role === 'teacher'
        ? (!m.read && m.from === 'parent')
        : (!m.read && m.from === 'teacher')
    ).length

  const getLastMsg = id => (convs[id] || []).slice(-1)[0]

  const getInitials = name =>
    name
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

  return createPortal(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

        * {
          font-family: 'Nunito', sans-serif;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
        }

        @keyframes bounce {
          0%,80%,100% {
            transform: translateY(0);
            opacity: .55;
          }
          40% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }

        @keyframes widgetPop {
          from {
            opacity: 0;
            transform: translateY(14px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseFab {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }

        @media (max-width: 640px) {
          .chat-widget-panel {
            position: fixed !important;
            top: max(12px, env(safe-area-inset-top)) !important;
            left: 12px !important;
            right: 12px !important;
            bottom: 82px !important;
            width: auto !important;
            border-radius: 24px !important;
          }
        }
      `}</style>

      <button onClick={() => setOpen(o => !o)} style={styles.fab}>
        {open ? (
          <span style={styles.fabClose}>✕</span>
        ) : (
          <>
            <span style={styles.fabEmoji}>💬</span>
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </>
        )}
      </button>

      {open && (
        <div className="chat-widget-panel" style={styles.panel}>
          <div style={styles.panelGlow1} />
          <div style={styles.panelGlow2} />

          <div style={styles.header}>
            {selected ? (
              <div style={styles.headerSelected}>
                <div style={styles.headerLeftGroup}>
                  <button onClick={() => setSelected(null)} style={styles.backBtn}>
                    ←
                  </button>

                  <div style={styles.avatarSm}>
                    {getInitials(selected.name)}
                  </div>
                </div>

                <div style={styles.headerTextWrap}>
                  <div style={styles.headerName}>{selected.name}</div>
                  <div style={styles.headerMeta}>
                    {role === 'parent'
                      ? selected.subject
                      : `Parent de ${selected.children}`}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={styles.headerTitle}>
                  {role === 'parent'
                    ? 'Contacter un enseignant'
                    : 'Messages des parents'}
                </div>
                <div style={styles.headerSub}>
                  Communication simple et bienveillante
                </div>
              </div>
            )}
          </div>

          {!selected && (
            <div style={styles.listWrap}>
              <div style={styles.listLabel}>
                {role === 'parent' ? 'Choisir un enseignant' : 'Parents'}
              </div>

              <div style={styles.contactList}>
                {list.map(contact => {
                  const unread = getUnread(contact.id)
                  const lastMsg = getLastMsg(contact.id)

                  return (
                    <div
                      key={contact.id}
                      style={styles.contactRow}
                      onClick={() => setSelected(contact)}
                    >
                      <div style={styles.avatarList}>
                        {getInitials(contact.name)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            ...styles.contactName,
                            fontWeight: unread > 0 ? 800 : 700
                          }}
                        >
                          {contact.name}
                        </div>

                        <div style={styles.contactMeta}>
                          {lastMsg
                            ? (lastMsg.text.length > 42
                                ? lastMsg.text.slice(0, 42) + '...'
                                : lastMsg.text)
                            : role === 'parent'
                              ? contact.subject
                              : `Parent de ${contact.children}`}
                        </div>
                      </div>

                      {unread > 0 && (
                        <span style={styles.unreadBadge}>{unread}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selected && (
            <>
              <div style={styles.messages}>
                {messages.length === 0 && (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyEmoji}>🌈</div>
                    <div style={styles.emptyText}>
                      {role === 'parent'
                        ? `Démarrez la conversation avec ${selected.name}`
                        : `Aucun message de ${selected.name} pour l'instant`}
                    </div>
                  </div>
                )}

                {messages.map(m => {
                  const isMe =
                    (role === 'parent' && m.from === 'parent') ||
                    (role === 'teacher' && m.from === 'teacher')

                  return (
                    <div
                      key={m.id}
                      style={{
                        ...styles.msgRow,
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          ...styles.msgBubble,
                          ...(isMe ? styles.msgBubbleMe : styles.msgBubbleOther)
                        }}
                      >
                        <div>{m.text}</div>
                        <div
                          style={{
                            ...styles.msgTime,
                            color: isMe
                              ? 'rgba(255,255,255,0.78)'
                              : '#8B86A3'
                          }}
                        >
                          {m.time}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {typing && (
                  <div style={styles.typingWrap}>
                    {[0, 0.18, 0.36].map((d, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.typingDot,
                          animation: `bounce 1s ${d}s infinite`
                        }}
                      />
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div style={styles.inputRow}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Écrire un message..."
                  style={styles.input}
                />

                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  style={{
                    ...styles.sendBtn,
                    opacity: input.trim() ? 1 : 0.5
                  }}
                >
                  ➜
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>,
    document.body
  )
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: 18,
    right: 18,
    zIndex: 1000,
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #8F6FE2, #FFBFA3)',
    boxShadow: '0 14px 30px rgba(143, 111, 226, 0.35)',
    animation: 'pulseFab 3.2s ease-in-out infinite'
  },

  fabEmoji: {
    fontSize: 24
  },

  fabClose: {
    fontSize: 18,
    color: 'white',
    fontWeight: 800
  },

  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    borderRadius: 999,
    background: '#FF6F91',
    color: 'white',
    fontSize: 10,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white'
  },

  panel: {
    position: 'fixed',
    right: 24,
    top: 24,
    bottom: 94,
    zIndex: 999,
    width: 360,
    borderRadius: 28,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.9)',
    boxShadow: '0 22px 60px rgba(129, 103, 187, 0.20)',
    animation: 'widgetPop .22s ease'
  },

  panelGlow1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: '50%',
    background: 'rgba(255, 204, 214, 0.35)',
    filter: 'blur(50px)',
    top: -40,
    right: -30,
    pointerEvents: 'none'
  },

  panelGlow2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: '50%',
    background: 'rgba(216, 194, 255, 0.30)',
    filter: 'blur(55px)',
    bottom: -40,
    left: -40,
    pointerEvents: 'none'
  },

  header: {
    position: 'relative',
    zIndex: 2,
    padding: '18px 16px 16px',
    minHeight: 82,
    background: 'linear-gradient(135deg, #8F6FE2, #A98CF4, #FFBEA6)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0
  },

  headerSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minWidth: 0
  },

  headerLeftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0
  },

  headerTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
    flex: 1
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: 'white'
  },

  headerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
    fontWeight: 600
  },

  headerName: {
    fontSize: 14,
    fontWeight: 800,
    color: 'white',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 2
  },

  headerMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 12,
    border: 'none',
    background: 'rgba(255,255,255,0.18)',
    color: 'white',
    fontSize: 18,
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.22)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.25)'
  },

  listWrap: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 2
  },

  listLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: '#9B95B7',
    padding: '14px 16px 8px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em'
  },

  contactList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 10px 12px'
  },

  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px',
    cursor: 'pointer',
    borderRadius: 18,
    marginBottom: 8,
    background: 'rgba(255,255,255,0.62)',
    border: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 8px 18px rgba(0,0,0,0.04)'
  },

  avatarList: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #EEE7FF, #FFEADF)',
    color: '#7C59C8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0
  },

  contactName: {
    fontSize: 13,
    color: '#433C63',
    marginBottom: 2
  },

  contactMeta: {
    fontSize: 11,
    color: '#8B86A3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1.35
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    background: 'linear-gradient(135deg, #8F6FE2, #FF9E8A)',
    color: 'white',
    fontSize: 10,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    boxShadow: '0 6px 14px rgba(143, 111, 226, 0.25)'
  },

  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '14px 14px 12px',
    position: 'relative',
    zIndex: 2
  },

  msgRow: {
    display: 'flex',
    marginBottom: 10
  },

  msgBubble: {
    maxWidth: '78%',
    padding: '10px 13px',
    fontSize: 13,
    lineHeight: 1.55,
    boxShadow: '0 8px 18px rgba(0,0,0,0.04)'
  },

  msgBubbleMe: {
    borderRadius: '18px 18px 6px 18px',
    background: 'linear-gradient(135deg, #8F6FE2, #7B59C6)',
    color: 'white'
  },

  msgBubbleOther: {
    borderRadius: '18px 18px 18px 6px',
    background: 'rgba(255,255,255,0.88)',
    color: '#3E3857',
    border: '1px solid rgba(255,255,255,0.92)'
  },

  msgTime: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'right',
    fontWeight: 700
  },

  typingWrap: {
    display: 'inline-flex',
    gap: 5,
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(255,255,255,0.9)',
    marginBottom: 8
  },

  typingDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#9F98BE'
  },

  emptyState: {
    textAlign: 'center',
    padding: '46px 10px'
  },

  emptyEmoji: {
    fontSize: 28,
    marginBottom: 8
  },

  emptyText: {
    fontSize: 13,
    color: '#8C86A5',
    fontStyle: 'italic',
    lineHeight: 1.6,
    fontWeight: 700
  },

  inputRow: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    gap: 10,
    padding: '12px',
    borderTop: '1px solid rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.50)',
    backdropFilter: 'blur(10px)',
    flexShrink: 0
  },

  input: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 18,
    border: '1px solid rgba(203, 192, 233, 0.5)',
    fontSize: 13,
    outline: 'none',
    background: 'rgba(255,255,255,0.94)',
    color: '#4A4467',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
  },

  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #8F6FE2, #FFB59B)',
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px rgba(143, 111, 226, 0.22)'
  }
}

export default ChatWidget