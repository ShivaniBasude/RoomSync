import { useState, useEffect } from 'react'
import { getStudents, getRooms, getAllocations, createAllocation, deleteAllocation } from '../api/api'
import toast from 'react-hot-toast'

export default function Allocation() {
  const [students,    setStudents]    = useState([])
  const [rooms,       setRooms]       = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [selStudent,  setSelStudent]  = useState('')
  const [selRoom,     setSelRoom]     = useState('')
  const [saving,      setSaving]      = useState(false)
  const [search,      setSearch]      = useState('')

  const load = async () => {
    try {
      const [s, r, a] = await Promise.all([getStudents(), getRooms(), getAllocations()])
      setStudents(s.data)
      setRooms(r.data)
      setAllocations(a.data)
    } catch { toast.error('Failed to load data') }
    finally   { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const unallocated = students.filter(s => !s.allocation && s.status !== 'allocated')
  const availRooms  = rooms.filter(r => r.available)
  const previewRoom = rooms.find(r => String(r.id) === String(selRoom))

  const assign = async () => {
    if (!selStudent || !selRoom) { toast.error('Please select both a student and a room'); return }
    setSaving(true)
    try {
      await createAllocation({ student_id: parseInt(selStudent), room_id: parseInt(selRoom) })
      toast.success('Room assigned successfully!')
      setSelStudent(''); setSelRoom('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to assign room')
    } finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Remove this allocation?')) return
    try { await deleteAllocation(id); toast.success('Allocation removed'); load() }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to remove') }
  }

  const filteredAlloc = allocations.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    const name = a.student_name || a.student?.name || ''
    const room = a.room_number  || a.room?.room_number || a.room?.number || ''
    return name.toLowerCase().includes(q) || String(room).toLowerCase().includes(q)
  })

  const pct = previewRoom
    ? Math.round(((previewRoom.occupied ?? 0) / (previewRoom.capacity || 1)) * 100)
    : 0

  return (
    <div className="page">
      <div className="phd">
        <div>
          <p className="eyebrow">Room Assignment</p>
          <h1>Allocation</h1>
          <p className="sub">{allocations.length} allocated · {unallocated.length} students waiting · {availRooms.length} rooms available</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

        {/* LEFT: Assign Panel */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-md)',
          overflow: 'hidden',
          position: 'sticky', top: 94,
        }}>
          {/* Panel header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-darker)',
          }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 400, color: 'var(--text)', marginBottom: 2 }}>
              Assign Room
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select a student and an available room</p>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Student select */}
            <div className="fgrp">
              <label className="lbl">Student</label>
              <select className="input select" value={selStudent} onChange={e => setSelStudent(e.target.value)}>
                <option value="">— Select student —</option>
                {unallocated.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}{(s.roll_no || s.roll_number) ? ` (${s.roll_no || s.roll_number})` : ''}
                  </option>
                ))}
              </select>
              {unallocated.length === 0 && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>All students are allocated</p>
              )}
            </div>

            {/* Room select */}
            <div className="fgrp">
              <label className="lbl">Room</label>
              <select className="input select" value={selRoom} onChange={e => setSelRoom(e.target.value)}>
                <option value="">— Select room —</option>
                {availRooms.map(r => {
                  const num = r.number || r.room_number || r.room_no
                  return (
                    <option key={r.id} value={r.id}>
                      Room {num} · {r.type} · {r.occupied ?? 0}/{r.capacity} occupied
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Room Preview mini-card */}
            {previewRoom && (
              <div style={{
                background: 'var(--bg-darker)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                padding: '14px 16px',
                animation: 'fadeUp .25s var(--ease) both',
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Room Preview
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--text)' }}>
                    Room {previewRoom.number || previewRoom.room_number || previewRoom.room_no}
                  </p>
                  <span className="badge bg-green">{previewRoom.type}</span>
                </div>
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: pct < 80 ? '#2D6A4F' : '#D97706', borderRadius: 999 }}/>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {previewRoom.occupied ?? 0} of {previewRoom.capacity} beds filled · {100 - pct}% free
                </p>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={assign}
              disabled={saving || !selStudent || !selRoom}
              style={{ width: '100%', opacity: (!selStudent || !selRoom) ? 0.5 : 1 }}
            >
              {saving ? 'Assigning…' : 'Assign Room'}
            </button>
          </div>
        </div>

        {/* RIGHT: Current Allocations */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 400, color: 'var(--text)' }}>
              Current Allocations
            </p>
            <div className="sw" style={{ maxWidth: 260 }}>
              <svg className="si" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input className="input si-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: '0.85rem' }}/>
            </div>
          </div>

          {loading ? (
            <div className="tbl-card">
              {[0,1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 58, marginBottom: 1 }}/>)}
            </div>
          ) : filteredAlloc.length === 0 ? (
            <div className="empty">
              <div className="empty-ico">🔗</div>
              <h3>No allocations yet</h3>
              <p>Use the panel on the left to assign rooms to students.</p>
            </div>
          ) : (
            <div className="tbl-card">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Room</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlloc.map((a, i) => {
                    const name   = a.student_name || a.student?.name || 'Unknown Student'
                    const roomNo = a.room_number  || a.room?.room_number || a.room?.number || a.room?.room_no
                    const type   = a.room_type    || a.room?.type || '—'
                    return (
                      <tr key={a.id} style={{ animation: `fadeUp .3s var(--ease) ${i * 30}ms both` }}>
                        <td>
                          <p style={{ fontWeight: 500 }}>{name}</p>
                        </td>
                        <td>
                          {roomNo
                            ? <span className="badge bg-green">Room {roomNo}</span>
                            : <span className="badge bg-muted">—</span>
                          }
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{type}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>Remove</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}