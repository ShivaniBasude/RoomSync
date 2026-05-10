/* Home.jsx — Dashboard */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const API = 'http://localhost:5000'

export default function Home() {
    const [stats, setStats] = useState({
        totalRooms: 0,
        totalStudents: 0,
        allocatedStudents: 0,
        availableRooms: 0,
    })
    const [loading, setLoading] = useState(true)
    const [recentAllocations, setRecentAllocations] = useState([])

    useEffect(() => {
        async function fetchStats() {
            try {
                const [roomsRes, studentsRes] = await Promise.all([
                    fetch(`${API}/rooms`),
                    fetch(`${API}/students`),
                ])
                const rooms = await roomsRes.json()
                const students = await studentsRes.json()

                const allocated = students.filter(s => s.room_number).length
                const available = rooms.filter(r => (r.occupied ?? 0) < r.capacity).length

                setStats({
                    totalRooms: rooms.length,
                    totalStudents: students.length,
                    allocatedStudents: allocated,
                    availableRooms: available,
                })

                // recent: last 5 allocated students
                const recent = students
                    .filter(s => s.room_number)
                    .slice(-5)
                    .reverse()
                setRecentAllocations(recent)
            } catch (e) {
                console.error('Failed to fetch stats:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const occupancyRate = stats.totalStudents > 0
        ? Math.round((stats.allocatedStudents / stats.totalStudents) * 100)
        : 0

    return (
        <div className="page-wrapper home-page slide-up">
            {/* Header */}
            <div className="home-hero">
                <div className="home-hero-text">
                    <p className="home-eyebrow">Dashboard</p>
                    <h1 className="home-title">Room<em>Sync</em></h1>
                    <p className="home-subtitle">
                        Hostel room allocation & management system
                    </p>
                </div>
                <div className="home-hero-actions">
                    <Link to="/rooms" className="btn btn-teal">Manage Rooms</Link>
                    <Link to="/students" className="btn btn-outline">View Students</Link>
                </div>
            </div>

            {/* Stats */}
            <div className="stat-strip">
                <div className="stat-card" style={{ '--bar-color': 'var(--teal)' }}>
                    <p className="stat-card-label">Total Rooms</p>
                    <p className="stat-card-value">{loading ? '—' : stats.totalRooms}</p>
                    <p className="stat-card-hint">{stats.availableRooms} available</p>
                </div>
                <div className="stat-card" style={{ '--bar-color': 'var(--accent)' }}>
                    <p className="stat-card-label">Students</p>
                    <p className="stat-card-value">{loading ? '—' : stats.totalStudents}</p>
                    <p className="stat-card-hint">{stats.allocatedStudents} allocated</p>
                </div>
                <div className="stat-card" style={{ '--bar-color': 'var(--gold)' }}>
                    <p className="stat-card-label">Occupancy Rate</p>
                    <p className="stat-card-value">{loading ? '—' : `${occupancyRate}%`}</p>
                    <p className="stat-card-hint">of students housed</p>
                </div>
                <div className="stat-card" style={{ '--bar-color': 'var(--red)' }}>
                    <p className="stat-card-label">Pending</p>
                    <p className="stat-card-value">{loading ? '—' : stats.totalStudents - stats.allocatedStudents}</p>
                    <p className="stat-card-hint">awaiting allocation</p>
                </div>
            </div>

            {/* Quick links */}
            <div className="home-quick-grid">
                <Link to="/rooms" className="home-quick-card card">
                    <div className="home-quick-icon" style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                            <path d="M9 21V12h6v9" />
                        </svg>
                    </div>
                    <div>
                        <p className="home-quick-title">Rooms</p>
                        <p className="home-quick-desc">Add, edit, or remove rooms</p>
                    </div>
                    <svg className="home-quick-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>

                <Link to="/students" className="home-quick-card card">
                    <div className="home-quick-icon" style={{ background: 'var(--gold-light)', color: '#9a7422' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                    </div>
                    <div>
                        <p className="home-quick-title">Students</p>
                        <p className="home-quick-desc">Manage student records</p>
                    </div>
                    <svg className="home-quick-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>

                <Link to="/allocation" className="home-quick-card card">
                    <div className="home-quick-icon" style={{ background: 'rgba(200,120,58,0.1)', color: 'var(--accent)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <path d="M17.5 14v6M14.5 17h6" />
                        </svg>
                    </div>
                    <div>
                        <p className="home-quick-title">Allocation</p>
                        <p className="home-quick-desc">Assign students to rooms</p>
                    </div>
                    <svg className="home-quick-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            {/* Recent allocations */}
            {recentAllocations.length > 0 && (
                <div className="home-recent">
                    <h2 className="section-heading" style={{ fontSize: '1.2rem' }}>Recent Allocations</h2>
                    <p className="section-sub">Latest students assigned to rooms</p>
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <table className="rs-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Roll No.</th>
                                    <th>Room</th>
                                    <th>Course</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAllocations.map(s => (
                                    <tr key={s.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span className="student-avatar"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: 28, height: 28, borderRadius: '50%',
                                                        background: 'var(--teal-light)', color: 'var(--teal-dim)',
                                                        fontSize: '0.72rem', fontWeight: 600, flexShrink: 0
                                                    }}>
                                                    {(s.name || '?')[0].toUpperCase()}
                                                </span>
                                                {s.name}
                                            </div>
                                        </td>
                                        <td>{s.roll_no || '—'}</td>
                                        <td><span className="badge badge-teal">Room {s.room_number}</span></td>
                                        <td>{s.course || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}