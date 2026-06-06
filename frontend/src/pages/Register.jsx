import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register as apiRegister } from '../api/api'
import toast from 'react-hot-toast'

const YEARS   = ['1st Year','2nd Year','3rd Year','4th Year','Postgraduate']
const PREFS   = ['Single','Double','Triple','No preference']
const GENDERS = ['Male','Female','Other','Prefer not to say']
const COURSES = ['B.Tech','M.Tech','BBA','MBA','B.Sc','M.Sc','B.Com','Other']

export default function Register() {
  const [form, setForm] = useState({
    name:'', email:'', password:'',
    roll_no:'', course:'', year:'', gender:'', preference:'', phone:''
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and password are required')
      return
    }
    setLoading(true)
    try {
      const res = await apiRegister(form)
      const d   = res.data
      login({ id: d.id, email: d.email, name: d.name, role: d.role, student_id: d.student_id }, d.access_token)
      toast.success('Welcome to RoomSync!')
      navigate('/student')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--register-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 580, animation: 'fadeUp .5s var(--ease) both' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--primary)', fontWeight: 400 }}>RoomSync</h1>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Create your student account</p>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-lg)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-darker)',
          }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--text)' }}>Student Registration</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>Fill in your details to request a hostel room</p>
          </div>

          {/* Form */}
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="frow">
              <div className="fgrp">
                <label className="lbl">Full Name *</label>
                <input className="input" placeholder="Priya Sharma" value={form.name} onChange={e => f('name', e.target.value)}/>
              </div>
              <div className="fgrp">
                <label className="lbl">Roll Number</label>
                <input className="input" placeholder="CS2024001" value={form.roll_no} onChange={e => f('roll_no', e.target.value)}/>
              </div>
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
                <label className="lbl">Room Preference</label>
                <select className="input select" value={form.preference} onChange={e => f('preference', e.target.value)}>
                  <option value="">No preference</option>
                  {PREFS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="fgrp">
                <label className="lbl">Phone</label>
                <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={e => f('phone', e.target.value)}/>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Account Details</p>
              <div className="fgrp">
                <label className="lbl">Email address *</label>
                <input className="input" type="email" placeholder="you@college.edu" value={form.email} onChange={e => f('email', e.target.value)}/>
              </div>
              <div className="fgrp">
                <label className="lbl">Password *</label>
                <input className="input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => f('password', e.target.value)}/>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mft" style={{ flexDirection: 'column', gap: 14 }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
