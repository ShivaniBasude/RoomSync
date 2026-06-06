import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAnalytics } from '../api/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({ label, value, icon, accentColor, sub, delay }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-light)',
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--sh-md)',
      padding: '22px 24px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
      animation: `fadeUp .5s var(--ease) ${delay}ms both`,
      transition: 'box-shadow 200ms, transform 200ms',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-lg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: `${accentColor}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '2rem', fontWeight: 400, color: 'var(--text)', lineHeight: 1 }}>
          {value ?? '—'}
        </p>
        {sub && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  )
}

function QuickCard({ to, icon, title, desc, delay }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block', animation: `fadeUp .5s var(--ease) ${delay}ms both` }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--sh-md)',
        padding: '24px',
        display: 'flex', alignItems: 'center', gap: 16,
        transition: 'all 200ms var(--ease)',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = 'var(--sh-lg)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = '' }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: 'var(--bg-darker)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem', fontWeight: 400, color: 'var(--text)', marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{desc}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  )
}

export default function Home() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .catch(() => toast.error('Could not load statistics'))
      .finally(() => setLoading(false))
  }, [])

  const stats = data ? [
    { label: 'Total Rooms',     value: data.total_rooms,     icon: '🏠', accentColor: '#2D6A4F', sub: `${data.available_rooms} currently available`, delay: 0 },
    { label: 'Students',        value: data.total_students,  icon: '👥', accentColor: '#1B6CA8', sub: `${data.allocated} allocated`,                  delay: 60 },
    { label: 'Occupancy',       value: `${data.occupancy_rate}%`, icon: '📊', accentColor: '#D97706', sub: 'of total capacity',                       delay: 120 },
    { label: 'Pending',         value: data.pending_requests || 0, icon: '⏳', accentColor: '#9E2A2B', sub: 'awaiting allocation',                    delay: 180 },
  ] : []

  return (
    <div className="page">

      {/* Header */}
      <div style={{ marginBottom: 40, paddingBottom: 28, borderBottom: '1px solid var(--border-light)' }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>{today}</p>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: '2.8rem',
          fontWeight: 400, color: 'var(--text)', lineHeight: 1.1, marginBottom: 8,
        }}>
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Here's what's happening in your hostel today.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="shimmer" style={{ height: 120, borderRadius: 'var(--r-md)' }}/>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
          {stats.map(s => <StatCard key={s.label} {...s}/>)}
        </div>
      )}

      {/* Quick access */}
      <div style={{ marginBottom: 16 }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>Quick Access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <QuickCard to="/rooms"      icon="🏠" title="Manage Rooms"    desc="Add, edit and configure hostel rooms"   delay={0}  />
          <QuickCard to="/students"   icon="👥" title="View Students"   desc="Browse and manage all student records" delay={60} />
          <QuickCard to="/allocation" icon="🔗" title="Assign Rooms"    desc="Allocate students to available rooms"  delay={120}/>
        </div>
      </div>

      {/* Analytics teaser */}
      {data && (
        <div style={{
          marginTop: 28,
          background: 'var(--surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-sm)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'fadeUp .5s var(--ease) 300ms both',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--text)', marginBottom: 2 }}>
              Hostel at {data.occupancy_rate}% occupancy
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {data.allocated} beds filled · {data.available_rooms} rooms open · {data.waitlisted || 0} on waitlist
            </p>
          </div>
          <Link to="/analytics" className="btn btn-outline btn-sm">
            View Analytics →
          </Link>
        </div>
      )}
    </div>
  )
}