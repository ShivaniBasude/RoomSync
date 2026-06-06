import { useState, useEffect } from 'react'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/api'
import toast from 'react-hot-toast'

const YEARS   = ['1st Year','2nd Year','3rd Year','4th Year','Postgraduate']
const GENDERS = ['Male','Female','Other','Prefer not to say']
const COURSES = ['B.Tech','M.Tech','BBA','MBA','B.Sc','M.Sc','B.Com','Other']
const BLANK   = { name:'', email:'', roll_no:'', course:'', year:'', gender:'', phone:'' }

const AVATAR_COLORS = ['#2D6A4F','#1B6CA8','#D97706','#7C3AED','#9E2A2B','#0891B2']

function initials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function avatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  let n = 0; for (const c of name) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

function StatusPill({ status }) {
  const map = {
    allocated:  { cls: 'bg-green',  label: 'Allocated'  },
    pending:    { cls: 'bg-amber',  label: 'Pending'    },
    waitlisted: { cls: 'bg-blue',   label: 'Waitlisted' },
  }
  const v = map[status?.toLowerCase()] || { cls: 'bg-muted', label: status || 'Unknown' }
  return <span className={`badge ${v.cls}`}>{v.label}</span>
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [show,     setShow]     = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(BLANK)

  const load = () =>
    getStudents()
      .then(r => setStudents(r.data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const list = students.filter(s => {
    if (filter === 'allocated'  && s.status !== 'allocated')  return false
    if (filter === 'pending'    && s.status !== 'pending')    return false
    if (filter === 'waitlisted' && s.status !== 'waitlisted') return false
    if (search) {
      const q = search.toLowerCase()
      return (s.name || '').toLowerCase().includes(q)
        || (s.email || '').toLowerCase().includes(q)
        || (s.roll_no || s.roll_number || '').toLowerCase().includes(q)
    }
    return true
  })

  const openAdd  = ()  => { setEditing(null); setForm(BLANK); setShow(true) }
  const openEdit = (s) => {
    setEditing(s)
    setForm({
      name:   s.name   || '',
      email:  s.email  || '',
      roll_no: s.roll_no || s.roll_number || '',
      course: s.course || '',
      year:   s.year   || '',
      gender: s.gender || '',
      phone:  s.phone  || '',
    })
    setShow(true)
  }

  const save = async () => {
    if (!form.name || !form.email) { toast.error('Name and email are required'); return }
    try {
      editing ? await updateStudent(editing.id, form) : await createStudent(form)
      toast.success(editing ? 'Student updated!' : 'Student added!')
      setShow(false); load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save student')
    }
  }

  const remove = async (id) => {
    if (!confirm('Remove this student? This cannot be undone.')) return
    try { await deleteStudent(id); toast.success('Student removed'); load() }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to delete') }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="page">
      {/* Header */}
      <div className="phd">
        <div>
          <p className="eyebrow">Hostel Management</p>
          <h1>Students</h1>
          <p className="sub">{students.length} registered · {students.filter(s => s.status === 'allocated').length} allocated</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Student
        </button>
      </div>

      {/* Slide-in Drawer */}
      {show && (
        <>
          <div className="overlay" onClick={() => setShow(false)} style={{ justifyContent: 'flex-end' }}>
            <div className="drawer" onClick={e => e.stopPropagation()} style={{ width: 480 }}>
              {/* Drawer header */}
              <div className="mhd" style={{ padding: '24px 28px', flexShrink: 0 }}>
                <div>
                  <h2>{editing ? 'Edit Student' : 'Add New Student'}</h2>
                  <p className="mhd-sub">Enter the student's details below</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShow(false)}>✕</button>
              </div>

              {/* Drawer body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="frow">
                  <div className="fgrp">
                    <label className="lbl">Full Name *</label>
                    <input className="input" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => f('name', e.target.value)}/>
                  </div>
                  <div className="fgrp">
                    <label className="lbl">Roll Number</label>
                    <input className="input" placeholder="CS2024001" value={form.roll_no} onChange={e => f('roll_no', e.target.value)}/>
                  </div>
                </div>
                <div className="fgrp">
                  <label className="lbl">Email *</label>
                  <input className="input" type="email" placeholder="student@college.edu" value={form.email} onChange={e => f('email', e.target.value)}/>
                </div>
                <div className="frow">
                  <div className="fgrp">
                    <label className="lbl">Course</label>
                    <select className="input select" value={form.course} onChange={e => f('course', e.target.value)}>
                      <option value="">Select course</option>
                      {COURSES.map(c => <option key={c}>{c}</option>)}
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
                <div className="frow">
                  <div className="fgrp">
                    <label className="lbl">Gender</label>
                    <select className="input select" value={form.gender} onChange={e => f('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="fgrp">
                    <label className="lbl">Phone</label>
                    <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => f('phone', e.target.value)}/>
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="mft" style={{ flexShrink: 0 }}>
                <button className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Add Student'}</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toolbar */}
      <div className="tbar">
        <div className="sw" style={{ maxWidth: 380 }}>
          <svg className="si" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="input si-input" placeholder="Search by name, email or roll number…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="fpills">
          {[
            { key: 'all', label: 'All' },
            { key: 'allocated',  label: 'Allocated'  },
            { key: 'pending',    label: 'Pending'    },
            { key: 'waitlisted', label: 'Waitlisted' },
          ].map(({ key, label }) => (
            <button key={key} className={`fpill ${filter === key ? 'on' : ''}`} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="tbl-card">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="shimmer" style={{ height: 62, margin: '0 0 1px', borderRadius: 0 }}/>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">👥</div>
          <h3>No students found</h3>
          <p>{search || filter !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first student to get started.'}</p>
          {!search && filter === 'all' && (
            <button className="btn btn-primary" onClick={openAdd}>Add Student</button>
          )}
        </div>
      ) : (
        <div className="tbl-card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Course & Year</th>
                <th>Room</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => {
                const roll = s.roll_no || s.roll_number || ''
                const room = s.allocation?.room_number || s.allocation?.room_no || s.allocation?.number
                const ac   = avatarColor(s.name)
                return (
                  <tr key={s.id} style={{ animation: `fadeUp .3s var(--ease) ${i * 30}ms both` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: ac, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {initials(s.name)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--text)', lineHeight: 1.2 }}>{s.name}</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {roll || '—'}
                    </td>
                    <td>
                      <p style={{ fontSize: '0.875rem' }}>{s.course || '—'}</p>
                      {s.year && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.year}</p>}
                    </td>
                    <td>
                      {room
                        ? <span className="badge bg-green">Room {room}</span>
                        : <span className="badge bg-muted">Unassigned</span>
                      }
                    </td>
                    <td><StatusPill status={s.status}/></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm"  onClick={() => remove(s.id)}>Remove</button>
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