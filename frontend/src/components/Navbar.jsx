/* components/Navbar.jsx */
import { Link, useLocation } from 'react-router-dom'

const NAV = [
    { to: '/', label: 'Dashboard' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/students', label: 'Students' },
    { to: '/allocation', label: 'Allocation' },
]

export default function Navbar() {
    const { pathname } = useLocation()

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(246,244,241,.94)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div style={{
                maxWidth: 1280, margin: '0 auto',
                padding: '0 40px', height: 66,
                display: 'flex', alignItems: 'center', gap: 32,
            }}>

                {/* Brand */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
                    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                        <rect x="1" y="1" width="11" height="11" rx="3" fill="var(--accent)" />
                        <rect x="16" y="1" width="11" height="11" rx="3" fill="var(--primary)" opacity=".55" />
                        <rect x="1" y="16" width="11" height="11" rx="3" fill="var(--primary)" opacity=".35" />
                        <rect x="16" y="16" width="11" height="11" rx="3" fill="var(--accent)" opacity=".65" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)' }}>
                        Room<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Sync</em>
                    </span>
                </Link>

                {/* Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    {NAV.map(({ to, label }) => {
                        const active = pathname === to
                        return (
                            <Link key={to} to={to} style={{
                                padding: '6px 14px',
                                borderRadius: 'var(--r-md)',
                                fontSize: '.87rem',
                                fontWeight: active ? 600 : 400,
                                color: active ? 'var(--primary)' : 'var(--text-2)',
                                textDecoration: 'none',
                                background: active ? 'var(--surface)' : 'transparent',
                                boxShadow: active ? 'var(--sh-sm)' : 'none',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                {label}
                                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                            </Link>
                        )
                    })}
                </div>

                {/* Admin */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px',
                    background: 'var(--primary)', color: '#fff',
                    borderRadius: 'var(--r-full)',
                    fontSize: '.78rem', fontWeight: 600,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                    Admin
                </div>
            </div>
        </nav>
    )
}