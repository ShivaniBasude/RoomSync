import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Navbar.css'

const NAV_LINKS = [
    { to: '/', label: 'Dashboard' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/students', label: 'Students' },
    { to: '/allocation', label: 'Allocation' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    // close mobile menu on route change
    useEffect(() => { setMenuOpen(false) }, [location])

    return (
        <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
            <div className="navbar-inner">
                {/* Logo */}
                <NavLink to="/" className="navbar-logo">
                    <span className="navbar-logo-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="9" height="9" rx="2" fill="currentColor" opacity="0.9" />
                            <rect x="13" y="3" width="9" height="9" rx="2" fill="currentColor" opacity="0.55" />
                            <rect x="2" y="14" width="9" height="9" rx="2" fill="currentColor" opacity="0.55" />
                            <rect x="13" y="14" width="9" height="9" rx="2" fill="currentColor" opacity="0.25" />
                        </svg>
                    </span>
                    <span className="navbar-logo-text">Room<strong>Sync</strong></span>
                </NavLink>

                {/* Desktop nav */}
                <nav className="navbar-links">
                    {NAV_LINKS.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `navbar-link${isActive ? ' navbar-link--active' : ''}`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right side */}
                <div className="navbar-right">
                    <span className="navbar-badge">Admin</span>
                    <button
                        className={`navbar-hamburger${menuOpen ? ' open' : ''}`}
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <nav className="navbar-mobile-menu">
                    {NAV_LINKS.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `navbar-mobile-link${isActive ? ' navbar-mobile-link--active' : ''}`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            )}
        </header>
    )
}