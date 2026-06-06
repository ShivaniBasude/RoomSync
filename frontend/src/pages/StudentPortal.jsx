import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMyStudent, getMyRequests, createRequest } from '../api/api'
import toast from 'react-hot-toast'

const PREFS  = ['Single','Double','Triple','No preference']
const FLOORS = ['Ground','1st','2nd','3rd','4th','Any']

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 100, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export default function StudentPortal() {
  const { user } = useAuth()
  const [student,    setStudent]  = useState(null)
  const [requests,   setRequests] = useState([])
  const [showForm,   setShowForm] = useState(false)
  const [form,       setForm]     = useState({ preferred_type: '', preferred_floor: '', notes: '' })
  const [loading,    setLoading]  = useState(true)
  const [submitting, setSub]      = useState(false)

  const load = async () => {
    try {
      const [s, r] = await Promise.all([getMyStudent(), getMyRequests()])
      setStudent(s.data)
      setRequests(r.data)
    } catch {
      toast.error('Failed to load your profile')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submitRequest = async () => {
    setSub(true)
    try {
      await createRequest(form)
      toast.success('Room request submitted!')
      setShowForm(false)
      setForm({ preferred_type: '', preferred_floor: '', notes: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit request')
    } finally { setSub(false) }
  }

  const statusMap = {
    allocated:  { cls: 'bg-green', label: 'Allocated'  },
    pending:    { cls: 'bg-amber', label: 'Pending'    },
    waitlisted: { cls: 'bg-blue',  label: 'Waitlisted' },
  }

  const reqMap = {
    pending:  { cls: 'bg-amber', label: 'Pending'  },
    approved: { cls: 'bg-green', label: 'Approved' },
    rejected: { cls: 'bg-red',   label: 'Rejected' },
  }

  if (loading) return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[0, 1].map(i => <div key={i} className="shimmer" style={{ height: 220, borderRadius: 'var(--r-md)' }}/>)}
      </div>
    </div>
  )

  const sb = statusMap[student?.status] || { cls: 'bg-muted', label: student?.status || 'Unknown' }
  const allocation = student?.allocation
  const roomNo     = allocation?.room_number || allocation?.room_no || allocation?.number

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
        <p className="eyebrow">Student Portal</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--text)' }}>
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          {student && <span className={`badge ${sb.cls}`} style={{ fontSize: '0.85rem', padding: '6px 16px' }}>{sb.label}</span>}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>{user?.email}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Room card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-md)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: 5,
            background: allocation ? '#2D6A4F' : student?.status === 'waitlisted' ? '#D97706' : '#EAE3D5',
          }}/>
          <div style={{ padding: '22px 24px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
              Your Room
            </p>
            {allocation ? (
              <>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '2.4rem', fontWeight: 400, color: 'var(--text)', lineHeight: 1 }}>
                  Room {roomNo}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6 }}>
                  {allocation.room_type || allocation.type || '—'}
                  {allocation.floor ? ` · Floor ${allocation.floor}` : ''}
                </p>
                <span className="badge bg-green" style={{ marginTop: 14 }}>✓ Confirmed</span>
              </>
            ) : student?.status === 'waitlisted' ? (
              <>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--text)' }}>On Waitlist</p>
                {student?.waitlist_position && (
                  <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
                    Position <strong style={{ color: 'var(--text)', fontSize: '1.1rem' }}>#{student.waitlist_position}</strong> in queue
                  </p>
                )}
                <span className="badge bg-amber" style={{ marginTop: 14 }}>⏳ Waiting</span>
              </>
            ) : (
              <>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--text-muted)' }}>Not yet assigned</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Submit a room request below to get started
                </p>
              </>
            )}
          </div>
        </div>

        {/* Profile card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-md)',
          padding: '22px 24px',
        }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 14 }}>
            Your Details
          </p>
          {student ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <InfoRow label="Roll Number" value={student.roll_no || student.roll_number}/>
              <InfoRow label="Course"      value={student.course}/>
              <InfoRow label="Year"        value={student.year}/>
              <InfoRow label="Gender"      value={student.gender}/>
              <InfoRow label="Preference"  value={student.preference}/>
              <InfoRow label="Phone"       value={student.phone}/>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No profile found. Please contact admin.</p>
          )}
        </div>
      </div>

      {/* Room Requests section */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--sh-md)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-darker)',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--text)' }}>Room Requests</p>
          </div>
          {!allocation && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
              {showForm ? 'Cancel' : '+ New Request'}
            </button>
          )}
        </div>

        <div style={{ padding: '22px 24px' }}>
          {/* Request form */}
          {showForm && (
            <div style={{
              background: 'var(--bg-darker)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              padding: '18px',
              marginBottom: 20,
              animation: 'fadeUp .25s var(--ease) both',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div className="frow">
                <div className="fgrp">
                  <label className="lbl">Preferred Room Type</label>
                  <select className="input select" value={form.preferred_type} onChange={e => setForm(p => ({ ...p, preferred_type: e.target.value }))}>
                    <option value="">Any type</option>
                    {PREFS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="fgrp">
                  <label className="lbl">Preferred Floor</label>
                  <select className="input select" value={form.preferred_floor} onChange={e => setForm(p => ({ ...p, preferred_floor: e.target.value }))}>
                    <option value="">Any floor</option>
                    {FLOORS.map(fl => <option key={fl}>{fl}</option>)}
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <label className="lbl">Additional Notes</label>
                <textarea className="input" rows={2} placeholder="Any special requirements or notes…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary btn-sm" onClick={submitRequest} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </div>
          )}

          {/* Requests list */}
          {requests.length === 0 ? (
            <div className="empty" style={{ minHeight: 160, border: 'none', padding: '24px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No requests submitted yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.map(r => {
                const rb = reqMap[r.status] || { cls: 'bg-muted', label: r.status }
                return (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--bg-darker)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--r-sm)',
                  }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--text)' }}>
                        {r.preferred_type || 'Any type'}
                        {r.preferred_floor ? ` · Floor ${r.preferred_floor}` : ''}
                      </p>
                      {r.notes && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.notes}</p>}
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`badge ${rb.cls}`}>{rb.label}</span>
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
