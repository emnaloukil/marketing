import { useState } from 'react'
import { useStudents }    from '../../hooks/useStudents'
import ChildCard          from '../../components/shared/ChildCard'
import AddChildModal      from '../../components/shared/AddChildModal'

export default function ChildrenPage() {
  const { children, loading, error, addChild } = useStudents()
  const [showModal, setShowModal] = useState(false)
  const [query,     setQuery]     = useState('')
  const [toast,     setToast]     = useState(false)

  const filtered = children.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase())
  )

  const handleAdd = async (formData) => {
    await addChild(formData)
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  return (
    <div style={{ background: '#f0ebff', minHeight: '100vh', padding: '2rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ background: '#ddd6fe', borderRadius: 30, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#5b21b6', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            My children
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2e1065', margin: '8px 0 4px' }}>
            My Children
          </h1>
          <p style={{ fontSize: 13, color: '#9d91c7', margin: 0 }}>
            {children.length} child{children.length !== 1 ? 'ren' : ''} registered
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#5b21b6', color: '#fff', border: 'none', borderRadius: 14, padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          + Add child
        </button>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '10px 16px', maxWidth: 300, display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.6rem' }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="#c4b8f0" strokeWidth="1.5"/>
          <path d="M10.5 10.5 14 14" stroke="#c4b8f0" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search a child..."
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#3730a3', width: '100%' }}
        />
      </div>

      {/* States */}
      {loading && <p style={{ color: '#a78bfa', fontSize: 14 }}>Loading...</p>}
      {error   && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

      {/* Grid */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
          {filtered.map((child, i) => (
            <ChildCard key={child._id} child={child} index={i} />
          ))}

          {/* Ghost card */}
          <div
            onClick={() => setShowModal(true)}
            style={{ borderRadius: 24, border: '2.5px dashed #c4b5fd', background: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minHeight: 216 }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v14M2 9h14" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, color: '#7c3aed', fontWeight: 700, margin: 0 }}>Add a child</p>
            <p style={{ fontSize: 11, color: '#c4b5fd', margin: 0 }}>Tap to register</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '11px 20px', fontSize: 13, fontWeight: 600, zIndex: 100, whiteSpace: 'nowrap' }}>
          ✓ Child added — student ID generated automatically
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddChildModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}