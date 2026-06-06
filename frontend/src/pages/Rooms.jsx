import { useState, useEffect } from 'react'
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api/api'
import toast from 'react-hot-toast'

const TYPES = ['Single', 'Double', 'Triple', 'Suite']
const TYPE_COLOR = {
  Single: '#2D6A4F',
  Double: '#1B6CA8',
  Triple: '#D97706',
  Suite:  '#7C3AED',
}
const BLANK = { number: '', floor: '', type: 'Single', capacity: 1 }

function RoomCard({ r, onEdit, onDelete }) {
  const pct   = Math.round((r.occupied / (r.capacity || 1)) * 100)
  const color = TYPE_COLOR[r.type] || TYPE_COLOR.Single
  const avail = r.available

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--sh-sm)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      transition: 'box-shadow 200ms, transform 200ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--sh-lg)'; e.currentTarget.querySelector('.rm-actions').style.opacity = '1' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.querySelector('.rm-actions').style.opacity = '0' }}
    >
      {/* Color top strip */}
      <div style={{
        height: 6,
        background: avail ? '#2D6A4F' : pct < 100 ? '#D97706' : '#9E2A2B',
      }}/>

      <div style={{ padding: '18px 20px', flex: 1 }}>
        {/* Room number & type */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{
              fontFamily: 'var(--serif)', fontSize: '1.35rem',
              fontWeight: 400, color: 'var(--text)', lineHeight: 1,
            }}>
              Room {r.number || r.room_number || r.room_no || '—'}
            </p>
            {r.floor && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                Floor {r.floor}
              </p>
            )}
          </div>
          <span className="badge" style={{
            background: `${color}18`, color, border: `1px solid ${color}28`,
          }}>
            {r.type}
          </span>
        </div>

        {/* Occupancy bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 5, background: 'var(--bg-darker)', borderRadius: 999, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: avail ? '#2D6A4F' : pct < 100 ? '#D97706' : '#9E2A2B',
              borderRadius: 999,
              transition: 'width .6s',
            }}/>
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {r.occupied ?? 0} / {r.capacity} occupied
          </p>
        </div>

        {/* Status badge */}
        <span className={`badge ${avail ? 'bg-green' : 'bg-red'}`}>
          {avail ? 'Available' : 'Full'}
        </span>
      </div>

      {/* Hover-reveal actions */}
      <div className="rm-actions" style={{
        display: 'flex', gap: 8, padding: '12px 20px',
        borderTop: '1px solid var(--border-light)',
        opacity: 0, transition: 'opacity 200ms',
        background: 'var(--surface-2)',
      }}>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => onEdit(r)}>Edit</button>
        <button className="btn btn-danger btn-sm"  style={{ flex: 1 }} onClick={() => onDelete(r.id)}>Delete</button>
      </div>
    </div>
  )
}

export default function Rooms() {
  const [rooms,   setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [show,    setShow]    = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(BLANK)

  const load = () =>
    getRooms()
      .then(r => setRooms(r.data))
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const list = rooms.filter(r => {
    const num = r.number || r.room_number || r.room_no || ''
    if (filter === 'available' && !r.available) return false
    if (filter === 'full'      &&  r.available) return false
    if (search) {
      const q = search.toLowerCase()
      return String(num).toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q)
    }
    return true
  })

  const openAdd  = ()  => { setEditing(null); setForm(BLANK); setShow(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({ number: r.number || r.room_number || r.room_no || '', floor: r.floor || '', type: r.type || 'Single', capacity: r.capacity || 1 })
    setShow(true)
  }

  const save = async () => {
    if (!form.number) { toast.error('Room number is required'); return }
    try {
      editing ? await updateRoom(editing.id, form) : await createRoom(form)
      toast.success(editing ? 'Room updated!' : 'Room added!')
      setShow(false); load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save room')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this room? This cannot be undone.')) return
    try { await deleteRoom(id); toast.success('Room deleted'); load() }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to delete') }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const avail = rooms.filter(r => r.available).length

  return (
    <div className="page">
      {/* Page header */}
      <div className="phd">
        <div>
          <p className="eyebrow">Hostel Management</p>
          <h1>Rooms</h1>
          <p className="sub">{rooms.length} rooms · {avail} available · {rooms.length - avail} occupied</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Room
        </button>
      </div>

      {/* Modal */}
      {show && (
        <div className="overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mhd">
              <div>
                <h2>{editing ? 'Edit Room' : 'Add New Room'}</h2>
                <p className="mhd-sub">Fill in the details below</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShow(false)}>✕</button>
            </div>
            <div className="mbody">
              <div className="fgrp">
                <label className="lbl">Room Number *</label>
                <input className="input" placeholder="e.g. 101" value={form.number} onChange={e => f('number', e.target.value)}/>
              </div>
              <div className="frow">
                <div className="fgrp">
                  <label className="lbl">Floor</label>
                  <input className="input" placeholder="e.g. 2" value={form.floor} onChange={e => f('floor', e.target.value)}/>
                </div>
                <div className="fgrp">
                  <label className="lbl">Type</label>
                  <select className="input select" value={form.type} onChange={e => f('type', e.target.value)}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <label className="lbl">Capacity</label>
                <input className="input" type="number" min="1" max="10" value={form.capacity} onChange={e => f('capacity', parseInt(e.target.value) || 1)}/>
              </div>
            </div>
            <div className="mft">
              <button className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Room'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="tbar">
        <div className="sw">
          <svg className="si" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="input si-input" placeholder="Search by room number or type…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="fpills">
          {['all', 'available', 'full'].map(p => (
            <button key={p} className={`fpill ${filter === p ? 'on' : ''}`} onClick={() => setFilter(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className="shimmer" style={{ height: 200, borderRadius: 'var(--r-md)' }}/>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">🏠</div>
          <h3>No rooms found</h3>
          <p>{search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first room to get started.'}</p>
          {!search && filter === 'all' && (
            <button className="btn btn-primary" onClick={openAdd}>Add Room</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {list.map((r, i) => (
            <div key={r.id} style={{ animation: `fadeUp .4s var(--ease) ${i * 40}ms both` }}>
              <RoomCard r={r} onEdit={openEdit} onDelete={remove}/>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}