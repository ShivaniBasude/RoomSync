/* Rooms.jsx */
import { useState, useEffect } from 'react'
import ViewRooms from '../components/ViewRooms'
import './Rooms.css'

const API = 'http://localhost:5000'
const EMPTY_FORM = { room_number: '', capacity: 2, floor: '', amenities: '' }

export default function Rooms() {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')  // all | available | full
    const [showModal, setShowModal] = useState(false)
    const [editRoom, setEditRoom] = useState(null) // null = new
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(null)

    useEffect(() => { loadRooms() }, [])

    async function loadRooms() {
        try {
            setLoading(true)
            const res = await fetch(`${API}/rooms`)
            const data = await res.json()
            setRooms(data)
        } catch {
            setError('Failed to load rooms. Is the backend running?')
        } finally {
            setLoading(false)
        }
    }

    function openAdd() {
        setEditRoom(null)
        setForm(EMPTY_FORM)
        setShowModal(true)
    }

    function openEdit(room) {
        setEditRoom(room)
        setForm({
            room_number: room.room_number,
            capacity: room.capacity,
            floor: room.floor || '',
            amenities: room.amenities || '',
        })
        setShowModal(true)
    }

    async function handleSave(e) {
        e.preventDefault()
        if (!form.room_number || !form.capacity) return
        setSaving(true)
        setError('')
        try {
            const url = editRoom ? `${API}/rooms/${editRoom.id}` : `${API}/rooms`
            const method = editRoom ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, capacity: Number(form.capacity) }),
            })
            if (!res.ok) throw new Error(await res.text())
            setSuccess(editRoom ? 'Room updated.' : 'Room added successfully.')
            setShowModal(false)
            loadRooms()
        } catch (err) {
            setError(err.message || 'Save failed.')
        } finally {
            setSaving(false)
            setTimeout(() => setSuccess(''), 3000)
        }
    }

    async function handleDelete(room) {
        try {
            const res = await fetch(`${API}/rooms/${room.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error(await res.text())
            setSuccess('Room deleted.')
            setConfirmDelete(null)
            loadRooms()
        } catch (err) {
            setError(err.message || 'Delete failed.')
        } finally {
            setTimeout(() => setSuccess(''), 3000)
        }
    }

    const displayed = rooms
        .filter(r => {
            if (filter === 'available') return (r.occupied ?? 0) < r.capacity
            if (filter === 'full') return (r.occupied ?? 0) >= r.capacity
            return true
        })
        .filter(r =>
            !search ||
            String(r.room_number).toLowerCase().includes(search.toLowerCase()) ||
            (r.floor && String(r.floor).toLowerCase().includes(search.toLowerCase()))
        )

    return (
        <div className="page-wrapper slide-up">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="section-heading">Rooms</h1>
                    <p className="section-sub">{rooms.length} rooms total · {rooms.filter(r => (r.occupied ?? 0) < r.capacity).length} available</p>
                </div>
                <button className="btn btn-teal" onClick={openAdd}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Room
                </button>
            </div>

            {/* Alerts */}
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-bar-wrap">
                    <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        className="form-input"
                        placeholder="Search by room number or floor…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-pills">
                    {['all', 'available', 'full'].map(f => (
                        <button
                            key={f}
                            className={`filter-pill${filter === f ? ' filter-pill--active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rooms grid */}
            {loading ? (
                <div className="loading-grid">
                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
                </div>
            ) : (
                <ViewRooms
                    rooms={displayed}
                    onEdit={openEdit}
                    onDelete={setConfirmDelete}
                />
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">{editRoom ? 'Edit Room' : 'Add New Room'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Room Number *</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. 101"
                                        value={form.room_number}
                                        onChange={e => setForm(f => ({ ...f, room_number: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Capacity *</label>
                                    <select
                                        className="form-select"
                                        value={form.capacity}
                                        onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                                    >
                                        {[1, 2, 3, 4].map(n => (
                                            <option key={n} value={n}>{n} — {['Single', 'Double', 'Triple', 'Quad'][n - 1]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label className="form-label">Floor</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. Ground, 1st…"
                                        value={form.floor}
                                        onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amenities</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. AC, Attached bath"
                                        value={form.amenities}
                                        onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-teal" disabled={saving}>
                                    {saving ? 'Saving…' : editRoom ? 'Save Changes' : 'Add Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="modal-box modal-box--sm" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Delete Room {confirmDelete.room_number}?</h2>
                        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
                            This action cannot be undone. Any students in this room will be unassigned.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete Room</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}