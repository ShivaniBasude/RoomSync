// frontend/src/pages/Students.jsx
import { useState } from 'react'

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const PREFS = ['Single', 'Double', 'Triple', 'No preference']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate']
const BLANK = { name: '', rollNo: '', course: '', year: '', gender: '', preference: '', phone: '', email: '' }
const AV_COLORS = ['#C8923A', '#277A5E', '#3A5FA0', '#7A3A9A', '#B03535', '#3A7AB8']

function avatarColor(name) {
    let h = 0
    for (const c of (name || 'A')) h = c.charCodeAt(0) + ((h << 5) - h)
    return AV_COLORS[Math.abs(h) % AV_COLORS.length]
}

export default function Students({ students = [], allocations = [], onAdd, onEdit, onDelete }) {
    const [show, setShow] = useState(false)
    const [editing, setEdit] = useState(null)
    const [form, setForm] = useState(BLANK)
    const [errs, setErrs] = useState({})
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')

    const isAllocated = (s) => allocations.some(a => a.studentId === s.id)

    const list = students.filter(s => {
        if (status === 'allocated' && !isAllocated(s)) return false
        if (status === 'unallocated' && isAllocated(s)) return false
        if (search) {
            const q = search.toLowerCase()
            return (s.name || '').toLowerCase().includes(q)
                || (s.rollNo || '').toLowerCase().includes(q)
                || (s.course || '').toLowerCase().includes(q)
        }
        return true
    })

    const openAdd = () => { setEdit(null); setForm(BLANK); setErrs({}); setShow(true) }
    const openEdit = (s) => {
        setEdit(s)
        setForm({
            name: s.name || '', rollNo: s.rollNo || '', course: s.course || '',
            year: s.year || '', gender: s.gender || '', preference: s.preference || '',
            phone: s.phone || '', email: s.email || ''
        })
        setErrs({}); setShow(true)
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name is required'
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
        setErrs(e)
        return Object.keys(e).length === 0
    }

    const save = () => {
        if (!validate()) return
        editing ? onEdit?.({ ...editing, ...form }) : onAdd?.(form)
        setShow(false)
    }

    const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

    return (
        <div className="page">

            {/* Header */}
            <div className="phd">
                <div>
                    <p className="eyebrow">Records</p>
                    <h1>Students</h1>
                    <p className="sub">
                        {students.length} student{students.length !== 1 ? 's' : ''} &middot;&nbsp;
                        {students.filter(isAllocated).length} allocated
                    </p>
                </div>
                <button className="btn btn-accent" onClick={openAdd}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                    Add Student
                </button>
            </div>

            {/* Modal */}
            {show && (
                <div className="overlay" onClick={() => setShow(false)}>
                    <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
                        <div className="mhd">
                            <div>
                                <h2>{editing ? 'Edit Student' : 'Add New Student'}</h2>
                                <p className="mhd-sub">Fill in the student's details below</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShow(false)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="mbody">
                            <p className="slbl">Personal Information</p>
                            <div className="frow">
                                <div className="fgrp">
                                    <label className="lbl">Full Name *</label>
                                    <input className={`input ${errs.name ? 'input-err' : ''}`} placeholder="e.g. Priya Sharma"
                                        value={form.name} onChange={e => f('name', e.target.value)} />
                                    {errs.name && <p className="ferr">{errs.name}</p>}
                                </div>
                                <div className="fgrp">
                                    <label className="lbl">Roll Number</label>
                                    <input className="input" placeholder="e.g. CS2024001"
                                        value={form.rollNo} onChange={e => f('rollNo', e.target.value)} />
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fgrp">
                                    <label className="lbl">Gender</label>
                                    <select className="input select" value={form.gender} onChange={e => f('gender', e.target.value)}>
                                        <option value="">Select gender</option>
                                        {GENDERS.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="fgrp">
                                    <label className="lbl">Year</label>
                                    <select className="input select" value={form.year} onChange={e => f('year', e.target.value)}>
                                        <option value="">Select year</option>
                                        {YEARS.map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <p className="slbl" style={{ marginTop: 4 }}>Academic &amp; Contact</p>
                            <div className="frow">
                                <div className="fgrp">
                                    <label className="lbl">Course / Department</label>
                                    <input className="input" placeholder="e.g. B.Tech Computer Science"
                                        value={form.course} onChange={e => f('course', e.target.value)} />
                                </div>
                                <div className="fgrp">
                                    <label className="lbl">Room Preference</label>
                                    <select className="input select" value={form.preference} onChange={e => f('preference', e.target.value)}>
                                        <option value="">Select preference</option>
                                        {PREFS.map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="frow">
                                <div className="fgrp">
                                    <label className="lbl">Email</label>
                                    <input className={`input ${errs.email ? 'input-err' : ''}`} type="email" placeholder="student@college.edu"
                                        value={form.email} onChange={e => f('email', e.target.value)} />
                                    {errs.email && <p className="ferr">{errs.email}</p>}
                                </div>
                                <div className="fgrp">
                                    <label className="lbl">Phone</label>
                                    <input className="input" placeholder="+91 98765 43210"
                                        value={form.phone} onChange={e => f('phone', e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="mft">
                            <button className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
                            <button className="btn btn-accent" onClick={save}>{editing ? 'Save Changes' : 'Add Student'}</button>
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
                    <input className="input si-input" placeholder="Search by name, roll number, or course…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="fpills">
                    {[{ k: 'all', l: 'All' }, { k: 'allocated', l: 'Allocated' }, { k: 'unallocated', l: 'Unallocated' }].map(({ k, l }) => (
                        <button key={k} className={`fpill ${status === k ? 'on' : ''}`} onClick={() => setStatus(k)}>{l}</button>
                    ))}
                </div>
            </div>

            {/* Table or empty */}
            {list.length === 0 ? (
                <div className="empty">
                    <div className="empty-ico">👤</div>
                    <h3>{students.length === 0 ? 'No students yet' : 'No results'}</h3>
                    <p>{students.length === 0 ? 'Add your first student to get started.' : 'Try adjusting your search or filter.'}</p>
                    {students.length === 0 && <button className="btn btn-accent" onClick={openAdd}>Add Student</button>}
                </div>
            ) : (
                <div className="card tbl-wrap">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Roll No.</th>
                                <th>Course</th>
                                <th>Year</th>
                                <th>Preference</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((s, i) => {
                                const alloc = isAllocated(s)
                                const color = avatarColor(s.name)
                                return (
                                    <tr key={s.id} style={{ animationDelay: `${i * 30}ms` }}>
                                        <td>
                                            <div className="sid">
                                                <div className="av" style={{ width: 34, height: 34, background: color, fontSize: '.88rem' }}>
                                                    {(s.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="sn">{s.name || '—'}</p>
                                                    {s.email && <p className="sm">{s.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="mono">{s.rollNo || <span className="dim">—</span>}</td>
                                        <td>{s.course || <span className="dim">—</span>}</td>
                                        <td>{s.year || <span className="dim">—</span>}</td>
                                        <td>
                                            {s.preference
                                                ? <span className="badge bg-muted">{s.preference}</span>
                                                : <span className="dim">—</span>}
                                        </td>
                                        <td>
                                            <span className={`badge ${alloc ? 'bg-green' : 'bg-amber'}`}>
                                                {alloc ? 'Allocated' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="sact">
                                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(s.id)}>
                                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}