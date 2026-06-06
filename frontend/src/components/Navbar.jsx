import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import toast from 'react-hot-toast'

const LINKS = [
  { to: '/',           label: 'Dashboard' },
  { to: '/rooms',      label: 'Rooms' },
  { to: '/students',   label: 'Students' },
  { to: '/allocation', label: 'Allocation' },
  { to: '/analytics',  label: 'Analytics' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  // If not logged in, don't show navbar
  if (!user) return null

  // If not admin, we only show home/portal
  const navLinks = isAdmin ? LINKS : [{ to: '/student', label: 'My Portal' }]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      boxShadow: 'var(--sh-sm)',
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 40px', height: 70,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Brand/Logo (Left) */}
        <Link to={isAdmin ? '/' : '/student'} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--serif)', fontSize: '1.45rem',
            color: 'var(--primary)', letterSpacing: '-0.02em',
            fontWeight: 400,
          }}>
            RoomSync
          </span>
        </Link>

        {/* Links (Center) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {navLinks.map(({ to, label }) => {
            const active = pathname === to
            return (
              <Link key={to} to={to} style={{
                position: 'relative',
                padding: '8px 0',
                fontSize: '0.9rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 150ms',
              }}>
                {label}
                {active && (
                  <span style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: 2, background: 'var(--primary)',
                    borderRadius: 2,
                  }}/>
                )}
              </Link>
            )
          })}
        </div>

        {/* Right side (Admin badge & actions) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <NotificationBell />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAdmin ? (
              <span className="badge bg-green" style={{
                padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600
              }}>
                Admin
              </span>
            ) : (
              <span className="badge bg-blue" style={{
                padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600
              }}>
                Student
              </span>
            )}
            
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

      </div>
    </nav>
  )
}