// frontend/src/pages/Rooms.jsx
import { useState } from 'react'

const TYPE_COLORS = {
    Single: { bg: 'var(--green-bg)', color: 'var(--green)' },
    Double: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    Triple: { bg: 'var(--amber-bg)', color: 'var(--amber)' },
    Suite: { bg: '#F3EAF8', color: '#7A3A9A' },
}
const BLANK = { number: '', floor: '', type: 'Single', capacity: 1 }

export default function Rooms({ rooms = [], allocations = [], onAdd, onEdit, onDelete }) {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [show, setShow] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(BLANK)
    const [err, setErr] = useState('')

    const occ = (r) => allocations.filter(a => a.roomId === r.id).length

    const list = rooms.filter(r => {
        const full = occ(r) >= (r.capacity || 1)
        if (filter === 'available' && full) return false
        if (filter === 'full' && !full) return false
        if (search) {
            const q = search.toLowerCase()
            return String(r.number || '').toLowerCase().includes(q)
                || String(r.floor || '').toLowerCase().includes(q)
                || (r.type || '').toLowerCase().includes(q)
        }
        return true
    })

    const openAdd = () => { setEditing(null); setForm(BLANK); setErr(''); setShow(true) }
    const openEdit = (r) => { setEditing(r); setForm({ number: r.number || '', floor: r.floor || '', type: r.type || 'Single', capacity: r.capacity || 1 }); setErr(''); setShow(true) }
    const save = () => {
        if (!String(form.number).trim()) { setErr('Room number is required.'); return }
        editing ? onEdit?.({ ...editing, ...form }) : onAdd?.(form)
        setShow(false)
    }
    const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

    return (
        <div className="page">

            {/* Header */}
            <div className="phd">
                <div>
                    <p className="eyebrow">Hostel Management</p>
                    <h1>Rooms</h1>
                    <p className="sub">
                        {rooms.length} room{rooms.length !== 1 ? 's' : ''} total &middot;&nbsp;
                        {rooms.filter(r => occ(r) < (r.capacity || 1)).length} available
                    </p>
                </div>
                <button className="btn btn-accent" onClick={openAdd}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
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
                                <p className="mhd-sub">Fill in the room details below</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShow(false)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="mbody">
                            {err && (
                                <div style={{ padding: '9px 13px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 'var(--r-md)', fontSize: '.84rem' }}>{err}</div>
                            )}
                            <div className="fgrp">
                                <label className="lbl">Room Number *</label>
                                <input className="input" placeholder="e.g. 101" value={form.number} onChange={e => f('number', e.target.value)} />
                            </div>
                            <div className="frow">
                                <div className="fgrp">
                                    <label className="lbl">Floor</label>
                                    <input className="input" placeholder="e.g. 1" value={form.floor} onChange={e => f('floor', e.target.value)} />
                                </div>
                                <div className="fgrp">
                                    <label className="lbl">Type</label>
                                    <select className="input select" value={form.type} onChange={e => f('type', e.target.value)}>
                                        <option>Single</option><option>Double</option>
                                        <option>Triple</option><option>Suite</option>
                                    </select>
                                </div>
                            </div>
                            <div className="fgrp">
                                <label className="lbl">Capacity</label>
                                <input className="input" type="number" min="1" max="10" value={form.capacity} onChange={e => f('capacity', parseInt(e.target.value) || 1)} />
                            </div>
                        </div>
                        <div className="mft">
                            <button className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
                            <button className="btn btn-accent" onClick={save}>{editing ? 'Save Changes' : 'Add Room'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="tbar">
                <div className="sw">
                    <svg className="si" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input className="input si-input" placeholder="Search by room number, floor, or type…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="fpills">
                    {['all', 'available', 'full'].map(f => (
                        <button key={f} className={`fpill ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {list.length === 0 ? (
                <div className="empty">
                    <div className="empty-ico">🏠</div>
                    <h3>No rooms found</h3>
                    <p>{search || filter !== 'all' ? 'Try adjusting your filters.' : 'Add your first room to get started.'}</p>
                    {!search && filter === 'all' && <button className="btn btn-accent" onClick={openAdd}>Add Room</button>}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                    {list.map((r, i) => {
                        const o = occ(r)
                        const cap = r.capacity || 1
                        const full = o >= cap
                        const pct = Math.round((o / cap) * 100)
                        const ts = TYPE_COLORS[r.type] || TYPE_COLORS.Single
                        return (
                            <div key={r.id} className="card" style={{
                                padding: 22, display: 'flex', flexDirection: 'column', gap: 14,
                                animation: `fadeUp .4s var(--ease) ${i * 40}ms both`,
                                transition: 'box-shadow 200ms var(--ease),transform 200ms var(--ease)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <p style={{ fontFamily: 'var(--serif)', fontSize: '1.08rem', fontWeight: 600, color: 'var(--primary)' }}>Room {r.number || '—'}</p>
                                        <span className="badge" style={{ background: ts.bg, color: ts.color }}>{r.type || 'Single'}</span>
                                    </div>
                                    <span className={`badge ${full ? 'bg-amber' : 'bg-green'}`}>{full ? 'Full' : 'Available'}</span>
                                </div>
                                {r.floor && <p style={{ fontSize: '.79rem', color: 'var(--muted)' }}>Floor {r.floor}</p>}
                                <div>
                                    <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 'var(--r-f)', overflow: 'hidden', marginBottom: 6 }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: full ? 'var(--red)' : 'var(--green)', borderRadius: 'var(--r-f)', transition: 'width .6s var(--ease)' }} />
                                    </div>
                                    <p style={{ fontSize: '.77rem', color: 'var(--muted)' }}>{o} / {cap} occupied</p>
                                </div>
                                <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border-lt)' }}>
                                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(r.id)}>Delete</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}