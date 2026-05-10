/* pages/Rooms.jsx */
import { useState } from 'react'

const TYPE_STYLE = {
    Single: { bg: 'var(--green-bg)', color: 'var(--green)' },
    Double: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    Triple: { bg: 'var(--amber-bg)', color: 'var(--amber)' },
    Suite: { bg: '#F3EAF8', color: '#7A3A9A' },
}
const EMPTY_FORM = { number: '', floor: '', type: 'Single', capacity: 1 }

export default function Rooms({ rooms = [], allocations = [], onAdd, onEdit, onDelete }) {
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editRoom, setEditRoom] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)

    const getOcc = (r) => allocations.filter(a => a.roomId === r.id).length

    const list = rooms.filter(r => {
        const full = getOcc(r) >= (r.capacity || 1)
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

    const openAdd = () => { setEditRoom(null); setForm(EMPTY_FORM); setShowForm(true) }
    const openEdit = (r) => { setEditRoom(r); setForm({ number: r.number || '', floor: r.floor || '', type: r.type || 'Single', capacity: r.capacity || 1 }); setShowForm(true) }
    const save = () => {
        if (!form.number) return
        editRoom ? onEdit?.({ ...editRoom, ...form }) : onAdd?.({ ...form, id: Date.now() })
        setShowForm(false)
    }

    return (
        <div className="page">
            {/* Header */}
            <div className="page-hd">
                <div>
                    <p className="eyebrow">Hostel Management</p>
                    <h1>Rooms</h1>
                    <p className="page-sub">{rooms.length} rooms total &middot; {rooms.filter(r => getOcc(r) < (r.capacity || 1)).length} available</p>
                </div>
                <button className="btn btn-accent" onClick={openAdd}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                    Add Room
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-hd">
                            <div>
                                <h2>{editRoom ? 'Edit Room' : 'Add New Room'}</h2>
                                <p className="modal-hd-sub">Fill in the room details</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grp">
                                <label className="label">Room Number *</label>
                                <input className="input" placeholder="e.g. 101" value={form.number}
                                    onChange={e => setForm(f => ({ ...f, number: e.target.value }))} />
                            </div>
                            <div className="form-row">
                                <div className="form-grp">
                                    <label className="label">Floor</label>
                                    <input className="input" placeholder="e.g. 1" value={form.floor}
                                        onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
                                </div>
                                <div className="form-grp">
                                    <label className="label">Type</label>
                                    <select className="input select" value={form.type}
                                        onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                        <option>Single</option><option>Double</option>
                                        <option>Triple</option><option>Suite</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-grp">
                                <label className="label">Capacity</label>
                                <input className="input" type="number" min="1" max="10" value={form.capacity}
                                    onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 1 }))} />
                            </div>
                        </div>
                        <div className="modal-ft">
                            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn btn-accent" onClick={save}>{editRoom ? 'Save Changes' : 'Add Room'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-wrap">
                    <svg className="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input className="input search-input" placeholder="Search by room number, floor, or type…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-group">
                    {['all', 'available', 'full'].map(f => (
                        <button key={f} className={`filter-btn ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 18 }}>
                    {list.map((r, i) => {
                        const occ = getOcc(r)
                        const cap = r.capacity || 1
                        const full = occ >= cap
                        const pct = Math.round((occ / cap) * 100)
                        const ts = TYPE_STYLE[r.type] || TYPE_STYLE.Single
                        return (
                            <div key={r.id} className="card" style={{
                                padding: '22px', display: 'flex', flexDirection: 'column', gap: 14,
                                animation: `fadeUp .4s var(--ease) ${i * 40}ms both`,
                                transition: 'box-shadow var(--mid) var(--ease), transform var(--mid) var(--ease)',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>
                                            Room {r.number || '—'}
                                        </p>
                                        <span className="badge" style={{ background: ts.bg, color: ts.color }}>{r.type || 'Single'}</span>
                                    </div>
                                    <span className={`badge ${full ? 'badge-amber' : 'badge-green'}`}>
                                        {full ? 'Full' : 'Available'}
                                    </span>
                                </div>
                                {r.floor && <p style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>Floor {r.floor}</p>}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: full ? 'var(--red)' : 'var(--green)', borderRadius: 'var(--r-full)', transition: 'width .6s var(--ease)' }} />
                                    </div>
                                    <p style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>{occ} / {cap} occupied</p>
                                </div>
                                <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
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