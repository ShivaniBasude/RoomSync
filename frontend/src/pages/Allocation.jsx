// frontend/src/pages/Allocation.jsx
import { useState } from 'react'

const AV_COLORS = ['#C8923A', '#277A5E', '#3A5FA0', '#7A3A9A', '#B03535', '#3A7AB8']
function avatarColor(name) {
    let h = 0
    for (const c of (name || 'A')) h = c.charCodeAt(0) + ((h << 5) - h)
    return AV_COLORS[Math.abs(h) % AV_COLORS.length]
}

export default function Allocation({ rooms = [], students = [], allocations = [], onAllocate, onDeallocate }) {
    const [selStudent, setSelStudent] = useState('')
    const [selRoom, setSelRoom] = useState('')
    const [search, setSearch] = useState('')
    const [flash, setFlash] = useState(null)   // { type:'ok'|'err', msg }

    const getOcc = (r) => allocations.filter(a => a.roomId === r.id).length

    const unallocated = students.filter(s => !allocations.some(a => a.studentId === s.id))
    const openRooms = rooms.filter(r => getOcc(r) < (r.capacity || 1))

    const byId = (arr, id) => arr.find(x => x.id === id || x.id === Number(id))

    const notify = (type, msg) => {
        setFlash({ type, msg })
        setTimeout(() => setFlash(null), 3000)
    }

    const assign = () => {
        if (!selStudent) { notify('err', 'Please select a student.'); return }
        if (!selRoom) { notify('err', 'Please select a room.'); return }
        onAllocate?.({ studentId: Number(selStudent), roomId: Number(selRoom) })
        setSelStudent(''); setSelRoom('')
        notify('ok', 'Student successfully assigned to room.')
    }

    const filtered = allocations.filter(a => {
        if (!search) return true
        const q = search.toLowerCase()
        const s = byId(students, a.studentId)
        const r = byId(rooms, a.roomId)
        return (s?.name || '').toLowerCase().includes(q)
            || (s?.rollNo || '').toLowerCase().includes(q)
            || String(r?.number || '').toLowerCase().includes(q)
    })

    const selStudentObj = byId(students, selStudent)
    const selRoomObj = byId(rooms, selRoom)

    return (
        <div className="page">

            {/* Header */}
            <div className="phd">
                <div>
                    <p className="eyebrow">Room Assignment</p>
                    <h1>Allocation</h1>
                    <p className="sub">
                        {allocations.length} allocated &middot;&nbsp;
                        {unallocated.length} pending &middot;&nbsp;
                        {openRooms.length} rooms available
                    </p>
                </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 28, alignItems: 'start' }}>

                {/* ── LEFT PANEL — Assign form ── */}
                <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 82 }}>
                    {/* Panel header */}
                    <div style={{
                        padding: '18px 22px', background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                        <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Assign Room</p>
                            <p style={{ fontSize: '.79rem', color: 'rgba(255,255,255,.65)', marginTop: 2 }}>Select a student and available room</p>
                        </div>
                    </div>

                    {/* Flash */}
                    {flash && (
                        <div style={{
                            margin: '14px 22px -4px',
                            padding: '9px 13px', borderRadius: 'var(--r-md)',
                            fontSize: '.83rem', fontWeight: 500,
                            background: flash.type === 'ok' ? 'var(--green-bg)' : 'var(--red-bg)',
                            color: flash.type === 'ok' ? 'var(--green)' : 'var(--red)',
                        }}>
                            {flash.msg}
                        </div>
                    )}

                    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                        {/* Student select */}
                        <div className="fgrp">
                            <label className="lbl">Student</label>
                            {unallocated.length === 0 ? (
                                <InfoBox>All students have been allocated.</InfoBox>
                            ) : (
                                <select className="input select" value={selStudent} onChange={e => setSelStudent(e.target.value)}>
                                    <option value="">— Select an unallocated student —</option>
                                    {unallocated.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}{s.rollNo ? ` — ${s.rollNo}` : ''}{s.course ? ` (${s.course})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Student preview */}
                        {selStudentObj && (
                            <Preview
                                left={<div className="av" style={{ width: 32, height: 32, background: avatarColor(selStudentObj.name), fontSize: '.85rem' }}>{selStudentObj.name.charAt(0).toUpperCase()}</div>}
                                title={selStudentObj.name}
                                sub={selStudentObj.preference ? `Prefers: ${selStudentObj.preference}` : selStudentObj.rollNo || ''}
                            />
                        )}

                        {/* Room select */}
                        <div className="fgrp">
                            <label className="lbl">Room</label>
                            {openRooms.length === 0 ? (
                                <InfoBox>No rooms currently available.</InfoBox>
                            ) : (
                                <select className="input select" value={selRoom} onChange={e => setSelRoom(e.target.value)}>
                                    <option value="">— Select an available room —</option>
                                    {openRooms.map(r => {
                                        const o = getOcc(r), c = r.capacity || 1
                                        return (
                                            <option key={r.id} value={r.id}>
                                                Room {r.number} — {r.type}, {o}/{c} occupied{r.floor ? `, Floor ${r.floor}` : ''}
                                            </option>
                                        )
                                    })}
                                </select>
                            )}
                        </div>

                        {/* Room preview */}
                        {selRoomObj && (
                            <Preview
                                pale
                                left={
                                    <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                }
                                title={`Room ${selRoomObj.number} · ${selRoomObj.type}`}
                                sub={`${getOcc(selRoomObj)}/${selRoomObj.capacity || 1} occupied${selRoomObj.floor ? ` · Floor ${selRoomObj.floor}` : ''}`}
                            />
                        )}

                        <button className="btn btn-accent" disabled={!selStudent || !selRoom}
                            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                            onClick={assign}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" />
                                <path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                                <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                            </svg>
                            Assign Room
                        </button>
                    </div>
                </div>

                {/* ── RIGHT — Current allocations ── */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>
                            Current Allocations
                        </p>
                        <div className="sw" style={{ maxWidth: 260 }}>
                            <svg className="si" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input className="input si-input" style={{ fontSize: '.85rem', padding: '8px 12px 8px 32px' }}
                                placeholder="Search student or room…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty">
                            <div className="empty-ico">🔗</div>
                            <h3>{allocations.length === 0 ? 'No allocations yet' : 'No results'}</h3>
                            <p>{allocations.length === 0 ? 'Use the form to assign students to rooms.' : 'Try adjusting your search.'}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {filtered.map((a, i) => {
                                const s = byId(students, a.studentId)
                                const r = byId(rooms, a.roomId)
                                if (!s || !r) return null
                                return (
                                    <div key={a.id} className="card" style={{
                                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                                        animation: `fadeUp .4s var(--ease) ${i * 35}ms both`,
                                        transition: 'box-shadow 200ms var(--ease),transform 200ms var(--ease)',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)' }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                                    >
                                        {/* Student */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                            <div className="av" style={{ width: 36, height: 36, background: avatarColor(s.name) }}>
                                                {(s.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p className="sn" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                                                {s.rollNo && <p className="sm">{s.rollNo}</p>}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>

                                        {/* Room */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p className="sn" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Room {r.number}</p>
                                                <p className="sm">{r.type}{r.floor ? ` · Floor ${r.floor}` : ''}</p>
                                            </div>
                                        </div>

                                        {/* Remove */}
                                        <button className="btn btn-danger btn-sm" style={{ flexShrink: 0 }} onClick={() => onDeallocate?.(a.id)}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                            Remove
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function InfoBox({ children }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 13px', background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
            fontSize: '.84rem', color: 'var(--muted)',
        }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {children}
        </div>
    )
}

function Preview({ left, title, sub, pale }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 13px', borderRadius: 'var(--r-md)',
            background: pale ? 'var(--surface-2)' : 'var(--accent-pale)',
            border: `1px solid ${pale ? 'var(--border)' : 'rgba(200,146,58,.2)'}`,
            animation: 'fadeUp .2s var(--ease)',
        }}>
            {left}
            <div>
                <p style={{ fontWeight: 500, fontSize: '.87rem', color: 'var(--primary)' }}>{title}</p>
                {sub && <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 1 }}>{sub}</p>}
            </div>
        </div>
    )
}