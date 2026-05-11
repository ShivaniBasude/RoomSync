// frontend/src/components/Navbar.jsx
// No CSS import needed — uses only CSS variables defined in index.css
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
    { to: '/', label: 'Dashboard' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/students', label: 'Students' },
    { to: '/allocation', label: 'Allocation' },
]

export default function Navbar() {
    const { pathname } = useLocation()

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 200,
            background: 'rgba(246,244,241,.94)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div style={{
                maxWidth: 1280, margin: '0 auto', padding: '0 40px',
                height: 66, display: 'flex', alignItems: 'center', gap: 28,
            }}>

                {/* ── Brand ── */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
                    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                        <rect x="1" y="1" width="11" height="11" rx="3" fill="var(--accent)" />
                        <rect x="16" y="1" width="11" height="11" rx="3" fill="var(--primary)" opacity=".55" />
                        <rect x="1" y="16" width="11" height="11" rx="3" fill="var(--primary)" opacity=".35" />
                        <rect x="16" y="16" width="11" height="11" rx="3" fill="var(--accent)" opacity=".65" />
                    </svg>
                    <span style={{
                        fontFamily: 'var(--serif)', fontSize: '1.22rem', fontWeight: 600,
                        color: 'var(--primary)', letterSpacing: '-.01em',
                    }}>
                        Room<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Sync</em>
                    </span>
                </Link>

                {/* ── Nav links ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    {LINKS.map(({ to, label }) => {
                        const active = pathname === to
                        return (
                            <Link key={to} to={to} style={{
                                padding: '6px 14px', borderRadius: 'var(--r-md)',
                                fontSize: '.87rem', fontWeight: active ? 600 : 400,
                                color: active ? 'var(--primary)' : 'var(--text-2)',
                                textDecoration: 'none',
                                background: active ? 'var(--surface)' : 'transparent',
                                boxShadow: active ? 'var(--sh-sm)' : 'none',
                                display: 'flex', alignItems: 'center', gap: 6,
                                transition: 'all 150ms var(--ease)',
                            }}>
                                {label}
                                {active && (
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* ── Admin badge ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', background: 'var(--primary)', color: '#fff',
                    borderRadius: 'var(--r-f)', fontSize: '.78rem', fontWeight: 600,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                    Admin
                </div>
            </div>
        </nav>
    )
}