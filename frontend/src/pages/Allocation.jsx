/* Allocation.jsx */
import { useState, useEffect } from 'react'
import './Allocation.css'
import './Rooms.css'

const API = 'http://localhost:5000'

export default function Allocation() {
    const [rooms, setRooms] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form state
    const [selectedStudent, setSelectedStudent] = useState('')
    const [selectedRoom, setSelectedRoom] = useState('')
    const [saving, setSaving] = useState(false)

    // View mode: table of current allocations
    const [search, setSearch] = useState('')

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            setLoading(true)
            const [r, s] = await Promise.all([
                fetch(`${API}/rooms`).then(x => x.json()),
                fetch(`${API}/students`).then(x => x.json()),
            ])
            setRooms(r)
            setStudents(s)
        } catch {
            setError('Failed to load data.')
        } finally {
            setLoading(false)
        }
    }

    async function handleAllocate(e) {
        e.preventDefault()
        if (!selectedStudent || !selectedRoom) return
        setSaving(true)
        setError('')
        try {
            const res = await fetch(`${API}/allocate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: selectedStudent, room_id: selectedRoom }),
            })
            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg || 'Allocation failed.')
            }
            setSuccess('Student allocated successfully!')
            setSelectedStudent('')
            setSelectedRoom('')
            loadData()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
            setTimeout(() => setSuccess(''), 4000)
        }
    }

    async function handleDeallocate(student) {
        setError('')
        try {
            const res = await fetch(`${API}/deallocate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: student.id }),
            })
            if (!res.ok) throw new Error(await res.text())
            setSuccess(`${student.name} removed from room.`)
            loadData()
        } catch (err) {
            setError(err.message || 'Deallocate failed.')
        } finally {
            setTimeout(() => setSuccess(''), 3000)
        }
    }

    // Derived data
    const unallocated = students.filter(s => !s.room_number)
    const allocated = students.filter(s => s.room_number)
    const availableRooms = rooms.filter(r => (r.occupied ?? 0) < r.capacity)

    const displayedAllocated = allocated.filter(s =>
        !search ||
        (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        String(s.room_number || '').includes(search)
    )

    const selectedRoomObj = rooms.find(r => String(r.id) === String(selectedRoom))

    return (
        <div className="page-wrapper slide-up">
            <div className="page-header">
                <div>
                    <h1 className="section-heading">Allocation</h1>
                    <p className="section-sub">
                        {allocated.length} allocated · {unallocated.length} pending · {availableRooms.length} rooms available
                    </p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="allocation-layout">
                {/* Left: Allocate form */}
                <div className="alloc-form-wrap card">
                    <h2 className="alloc-form-title">
                        <span className="alloc-form-title-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                            </svg>
                        </span>
                        Assign Room
                    </h2>

                    {loading ? (
                        <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>Loading…</p>
                    ) : (
                        <form onSubmit={handleAllocate}>
                            <div className="form-group">
                                <label className="form-label">Student *</label>
                                <select
                                    className="form-select"
                                    value={selectedStudent}
                                    onChange={e => setSelectedStudent(e.target.value)}
                                    required
                                >
                                    <option value="">— Select an unallocated student —</option>
                                    {unallocated.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.roll_no})
                                        </option>
                                    ))}
                                </select>
                                {unallocated.length === 0 && (
                                    <p className="form-hint">All students are already allocated.</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Room *</label>
                                <select
                                    className="form-select"
                                    value={selectedRoom}
                                    onChange={e => setSelectedRoom(e.target.value)}
                                    required
                                >
                                    <option value="">— Select an available room —</option>
                                    {availableRooms.map(r => (
                                        <option key={r.id} value={r.id}>
                                            Room {r.room_number} — {r.occupied ?? 0}/{r.capacity} occupied
                                            {r.floor ? ` · Floor ${r.floor}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {availableRooms.length === 0 && (
                                    <p className="form-hint form-hint--warn">No rooms available. Please add or free up a room.</p>
                                )}
                            </div>

                            {/* Room preview */}
                            {selectedRoomObj && (
                                <div className="room-preview">
                                    <p className="room-preview-label">Room preview</p>
                                    <p className="room-preview-num">Room {selectedRoomObj.room_number}</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                                        <span className="badge badge-teal">{selectedRoomObj.occupied ?? 0}/{selectedRoomObj.capacity} occupied</span>
                                        {selectedRoomObj.floor && <span className="badge badge-ink">Floor {selectedRoomObj.floor}</span>}
                                        {selectedRoomObj.amenities && <span className="badge badge-gold">{selectedRoomObj.amenities}</span>}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-teal"
                                disabled={saving || !selectedStudent || !selectedRoom}
                                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                            >
                                {saving ? 'Allocating…' : 'Confirm Allocation'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Right: Current allocations */}
                <div className="alloc-list-wrap">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--ink)' }}>
                            Current Allocations
                        </h2>
                        <div className="search-bar-wrap" style={{ maxWidth: 280 }}>
                            <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                className="form-input"
                                placeholder="Search student or room…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-grid" style={{ gridTemplateColumns: '1fr' }}>
                            {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" style={{ height: 52 }} />)}
                        </div>
                    ) : displayedAllocated.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔗</div>
                            <p className="empty-state-text">No allocations yet. Use the form to assign students.</p>
                        </div>
                    ) : (
                        <div className="card" style={{ overflow: 'hidden' }}>
                            <table className="rs-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Roll No.</th>
                                        <th>Room</th>
                                        <th>Course</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedAllocated.map(s => (
                                        <tr key={s.id} className="fade-in">
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: 28, height: 28, borderRadius: '50%',
                                                        background: 'var(--teal-light)', color: 'var(--teal-dim)',
                                                        fontSize: '0.72rem', fontWeight: 600, flexShrink: 0
                                                    }}>
                                                        {(s.name || '?')[0].toUpperCase()}
                                                    </span>
                                                    {s.name}
                                                </div>
                                            </td>
                                            <td>{s.roll_no || '—'}</td>
                                            <td><span className="badge badge-teal">Room {s.room_number}</span></td>
                                            <td>{s.course || '—'}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeallocate(s)}>
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}