/* pages/Home.jsx */
import { Link } from 'react-router-dom'

const STAT_COLORS = ['#C8923A', '#277A5E', '#3A5FA0', '#B03535']

export default function Home({ rooms = [], students = [], allocations = [] }) {
    const totalRooms = rooms.length
    const available = rooms.filter(r => {
        const occ = allocations.filter(a => a.roomId === r.id).length
        return occ < (r.capacity || 1)
    }).length
    const allocated = allocations.length
    const pending = students.filter(s => !allocations.find(a => a.studentId === s.id)).length
    const capacity = rooms.reduce((s, r) => s + (r.capacity || 1), 0)
    const occupancy = capacity > 0 ? Math.round((allocated / capacity) * 100) : 0

    const stats = [
        { label: 'Total Rooms', value: totalRooms, sub: `${available} available`, icon: '🏠' },
        { label: 'Students', value: students.length, sub: `${allocated} allocated`, icon: '👥' },
        { label: 'Occupancy Rate', value: `${occupancy}%`, sub: 'of students housed', icon: '📊' },
        { label: 'Pending', value: pending, sub: 'awaiting allocation', icon: '⏳' },
    ]

    const links = [
        { to: '/rooms', title: 'Rooms', desc: 'Add, edit, or remove rooms', icon: '🏠' },
        { to: '/students', title: 'Students', desc: 'Manage student records', icon: '👤' },
        { to: '/allocation', title: 'Allocation', desc: 'Assign students to rooms', icon: '🔗' },
    ]

    return (
        <div className="page">
            {/* Hero */}
            <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                gap: 24, marginBottom: 44,
                paddingBottom: 28, borderBottom: '1px solid var(--border)',
            }}>
                <div>
                    <p className="eyebrow">Hostel Management</p>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1, letterSpacing: '-.02em' }}>
                        Room<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Sync</em>
                    </h1>
                    <p style={{ marginTop: 8, fontSize: '1rem', color: 'var(--text-2)', fontWeight: 300 }}>
                        Hostel room allocation &amp; management system
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                    <Link to="/rooms" className="btn btn-primary">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Manage Rooms
                    </Link>
                    <Link to="/students" className="btn btn-outline">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        View Students
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 44 }}>
                {stats.map((s, i) => (
                    <div key={i} className="card" style={{
                        padding: '22px 20px', position: 'relative', overflow: 'hidden',
                        animation: `fadeUp .5s var(--ease) ${i * 60}ms both`,
                        transition: 'box-shadow var(--mid) var(--ease), transform var(--mid) var(--ease)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                    >
                        {/* Left accent bar */}
                        <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: STAT_COLORS[i], borderRadius: '4px 0 0 4px' }} />
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 'var(--r-md)',
                                background: 'var(--surface-2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem', flexShrink: 0,
                            }}>{s.icon}</div>
                            <div>
                                <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</p>
                                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--primary)', lineHeight: 1 }}>{s.value}</p>
                                <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.sub}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick links */}
            <p style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Quick Access</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {links.map((l, i) => (
                    <Link key={i} to={l.to} style={{ textDecoration: 'none', animation: `fadeUp .5s var(--ease) ${200 + i * 60}ms both` }}>
                        <div className="card" style={{
                            padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
                            transition: 'all var(--mid) var(--ease)', cursor: 'pointer',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-md)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '' }}
                        >
                            <div style={{ width: 46, height: 46, borderRadius: 'var(--r-md)', background: 'var(--accent-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                {l.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 2 }}>{l.title}</p>
                                <p style={{ fontSize: '.83rem', color: 'var(--text-2)' }}>{l.desc}</p>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}