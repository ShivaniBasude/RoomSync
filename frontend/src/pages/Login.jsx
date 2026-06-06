import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin } from '../api/api'
import toast from 'react-hot-toast'

/* Inline SVG architectural pattern for the left panel */
const ARCH_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='140'%3E%3Crect width='120' height='140' fill='none'/%3E%3C!-- Arched doorway --%3E%3Cpath d='M30 140 L30 60 Q30 30 60 30 Q90 30 90 60 L90 140' fill='none' stroke='%232D5A3D' stroke-width='1.2'/%3E%3C!-- Inner arch --%3E%3Cpath d='M42 140 L42 68 Q42 45 60 45 Q78 45 78 68 L78 140' fill='none' stroke='%23234830' stroke-width='0.8'/%3E%3C!-- Window frame top --%3E%3Crect x='48' y='65' width='24' height='20' rx='3' fill='none' stroke='%232D5A3D' stroke-width='0.7'/%3E%3C!-- Window cross --%3E%3Cline x1='60' y1='65' x2='60' y2='85' stroke='%23234830' stroke-width='0.5'/%3E%3Cline x1='48' y1='75' x2='72' y2='75' stroke='%23234830' stroke-width='0.5'/%3E%3C!-- Small diamond dots --%3E%3Ccircle cx='15' cy='15' r='1.5' fill='%232D5A3D'/%3E%3Ccircle cx='105' cy='15' r='1.5' fill='%232D5A3D'/%3E%3Ccircle cx='60' cy='120' r='1' fill='%23234830'/%3E%3C!-- Side geometric squares --%3E%3Crect x='5' y='100' width='14' height='14' fill='none' stroke='%23234830' stroke-width='0.6'/%3E%3Crect x='101' y='100' width='14' height='14' fill='none' stroke='%23234830' stroke-width='0.6'/%3E%3C/svg%3E")`

const FEATURES = [
  { text: 'Instant room allocation' },
  { text: 'Live occupancy tracking' },
  { text: 'Student self-registration' },
]

export default function Login() {
  const [tab,      setTab]      = useState('admin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const res = await apiLogin({ email, password })
      const d   = res.data
      login({ id: d.id, email: d.email, name: d.name, role: d.role, student_id: d.student_id }, d.access_token)
      toast.success(`Welcome back, ${d.name}!`)
      navigate(d.role === 'admin' ? '/' : '/student')
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Wrong password or email address. Please try again.')
      } else {
        toast.error(err.response?.data?.detail || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
    }}>

      {/* ═══════════ LEFT PANEL — Branding (60%) ═══════════ */}
      <div style={{
        flex: '0 0 60%',
        background: '#1B3A2D',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 72px',
      }}>
        {/* Layered architectural SVG pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: ARCH_PATTERN,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 140px',
          opacity: 0.25,
          pointerEvents: 'none',
        }}/>

        {/* Warm amber radial overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 40% 50%, rgba(212,168,67,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}/>

        {/* Subtle top-right green glow */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45,90,61,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          {/* Logo */}
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: '3.6rem',
            fontWeight: 400,
            color: '#F5F0E8',
            lineHeight: 1.05,
            marginBottom: 16,
          }}>
            RoomSync
          </h1>

          {/* Tagline */}
          <p style={{
            fontSize: '1.15rem',
            color: 'rgba(245,240,232,0.7)',
            lineHeight: 1.5,
            marginBottom: 48,
            maxWidth: 360,
            fontWeight: 300,
          }}>
            Modern hostel room management — thoughtfully designed for institutions that care.
          </p>

          {/* Feature highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                animation: `fadeUp .5s var(--ease) ${400 + i * 120}ms both`,
              }}>
                {/* Checkmark circle */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(245,240,232,0.08)',
                  border: '1px solid rgba(245,240,232,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{
                  fontSize: '0.95rem',
                  color: 'rgba(245,240,232,0.75)',
                  fontWeight: 400,
                }}>
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          {/* Decorative divider */}
          <div style={{
            marginTop: 56,
            width: 48, height: 2,
            background: 'linear-gradient(90deg, rgba(212,168,67,0.5), transparent)',
            borderRadius: 2,
          }}/>
          <p style={{
            marginTop: 14,
            fontSize: '0.78rem',
            color: 'rgba(245,240,232,0.35)',
            letterSpacing: '0.06em',
          }}>
            Trusted by educational institutions
          </p>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL — Login Form (40%) ═══════════ */}
      <div style={{
        flex: '0 0 40%',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
      }}>
        {/* Subtle background warmth */}
        <div style={{
          position: 'absolute', top: '20%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1, animation: 'fadeUp .5s var(--ease) 200ms both' }}>
          {/* Small logo repeat on right side */}
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: '1.3rem',
            color: 'var(--primary)',
            marginBottom: 6,
          }}>
            RoomSync
          </p>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: 32,
          }}>
            Sign in to your account
          </p>

          {/* Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-lg)',
            overflow: 'hidden',
          }}>
            {/* Tab switcher */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              borderBottom: '1px solid var(--border-light)',
            }}>
              {['admin', 'student'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '14px 20px',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: '0.88rem',
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                  background: tab === t ? 'var(--surface)' : 'var(--bg-darker)',
                  transition: 'all 150ms',
                  borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                }}>
                  {t === 'admin' ? 'Admin' : 'Student'}
                </button>
              ))}
            </div>

            {/* Form body */}
            <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="fgrp">
                <label className="lbl">Email address</label>
                <input
                  className="input"
                  type="email"
                  placeholder={tab === 'admin' ? 'manager@roomsync.com' : 'student@college.edu'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div className="fgrp">
                <label className="lbl">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '13px',
                  fontSize: '0.93rem',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>

              {tab === 'student' && (
                <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  No account?{' '}
                  <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Register here
                  </Link>
                </p>
              )}
            </div>
          </div>

          <p style={{
            textAlign: 'center', marginTop: 28,
            fontSize: '0.76rem', color: 'var(--text-muted)',
          }}>
            Secure hostel management platform
          </p>
        </div>
      </div>

      {/* ═══════════ Mobile responsive override ═══════════ */}
      <style>{`
        @media (max-width: 768px) {
          /* On mobile, hide left panel, make right panel full width */
          div[style*="flex: 0 0 60%"] {
            display: none !important;
          }
          div[style*="flex: 0 0 40%"] {
            flex: 1 1 100% !important;
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
