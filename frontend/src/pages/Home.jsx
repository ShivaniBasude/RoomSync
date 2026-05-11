// frontend/src/pages/Home.jsx
// No separate CSS file — all styles from index.css classes + inline
import { Link } from 'react-router-dom'

const ACC = ['var(--accent)', 'var(--green)', 'var(--blue)', 'var(--red)']

export default function Home({ rooms = [], students = [], allocations = [] }) {
    const cap = rooms.reduce((s, r) => s + (r.capacity || 1), 0)
    const allocated = allocations.length
    const available = rooms.filter(r => allocations.filter(a => a.roomId === r.id).length < (r.capacity || 1)).length
    const pending = students.filter(s => !allocations.find(a => a.studentId === s.id)).length
    const occupancy = cap > 0 ? Math.round((allocated / cap) * 100) : 0

    const STATS = [
        { label: 'Total Rooms', value: rooms.length, sub: `${available} available`, icon: '🏠' },
        { label: 'Students', value: students.length, sub: `${allocated} allocated`, icon: '👥' },
        { label: 'Occupancy Rate', value: `${occupancy}%`, sub: 'of students housed', icon: '📊' },
        { label: 'Pending', value: pending, sub: 'awaiting allocation', icon: '⏳' },
    ]

    const QUICK = [
        { to: '/rooms', title: 'Rooms', desc: 'Add, edit, or remove rooms', icon: '🏠' },
        { to: '/students', title: 'Students', desc: 'Manage student records', icon: '👤' },
        { to: '/allocation', title: 'Allocation', desc: 'Assign students to rooms', icon: '🔗' },
    ]

    return (
        <div className="page">

            {/* ── Hero ── */}
            <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                gap: 20, marginBottom: 44, paddingBottom: 28, borderBottom: '1px solid var(--border)',
            }}>
                <div>
                    <p className="eyebrow">Hostel Management</p>
                    <h1 style={{ fontFamily: 'var(--serif)', fontSize: '3rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, letterSpacing: '-.02em' }}>
                        Room<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Sync</em>
                    </h1>
                    <p style={{ marginTop: 8, fontSize: '1rem', color: 'var(--text-2)', fontWeight: 300 }}>
                        Hostel room allocation &amp; management system
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                    <Link to="/rooms" className="btn btn-primary">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Manage Rooms
                    </Link>
                    <Link to="/students" className="btn btn-outline">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                        </svg>
                        View Students
                    </Link>
                </div>
            </div>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 44 }}>
                {STATS.map((s, i) => (
                    <StatCard key={i} {...s} color={ACC[i]} delay={i * 60} />
                ))}
            </div>

            {/* ── Quick access ── */}
            <p style={{ fontSize: '.69rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
                Quick Access
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {QUICK.map((q, i) => (
                    <QuickCard key={i} {...q} delay={200 + i * 60} />
                ))}
            </div>
        </div>
    )
}

function StatCard({ label, value, sub, icon, color, delay }) {
    return (
        <div className="card" style={{
            padding: '20px', position: 'relative', overflow: 'hidden',
            animation: `fadeUp .5s var(--ease) ${delay}ms both`,
            transition: 'box-shadow 200ms var(--ease), transform 200ms var(--ease)',
            cursor: 'default',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
        >
            <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: color, borderRadius: '4px 0 0 4px', opacity: .8 }} />
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0 }}>
                    {icon}
                </div>
                <div>
                    <p style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>{label}</p>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 600, color: 'var(--primary)', lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: '.77rem', color: 'var(--muted)', marginTop: 3 }}>{sub}</p>
                </div>
            </div>
        </div>
    )
}

function QuickCard({ to, title, desc, icon, delay }) {
    return (
        <Link to={to} style={{ textDecoration: 'none', animation: `fadeUp .5s var(--ease) ${delay}ms both`, display: 'block' }}>
            <div className="card" style={{
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all 200ms var(--ease)', cursor: 'pointer',
            }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '' }}
            >
                <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '.98rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: '.82rem', color: 'var(--text-2)' }}>{desc}</p>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    )
}