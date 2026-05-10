/* Allocation.jsx */
import { useState } from 'react';
import './Allocation.css';

export default function Allocation({ rooms = [], students = [], allocations = [], onAllocate, onDeallocate }) {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getOccupancy = (room) =>
        allocations.filter(a => a.roomId === room.id).length;

    const unallocatedStudents = students.filter(
        s => !allocations.some(a => a.studentId === s.id)
    );

    const availableRooms = rooms.filter(r => {
        const occ = getOccupancy(r);
        return occ < (r.capacity || 1);
    });

    const handleAssign = () => {
        setError(''); setSuccess('');
        if (!selectedStudent) { setError('Please select a student.'); return; }
        if (!selectedRoom) { setError('Please select a room.'); return; }
        onAllocate?.({ studentId: selectedStudent, roomId: selectedRoom, id: Date.now() });
        setSuccess('Student successfully assigned to room.');
        setSelectedStudent(''); setSelectedRoom('');
        setTimeout(() => setSuccess(''), 3000);
    };

    const getStudentById = (id) => students.find(s => s.id === id || s.id === parseInt(id));
    const getRoomById = (id) => rooms.find(r => r.id === id || r.id === parseInt(id));

    const filteredAllocations = allocations.filter(a => {
        if (!search) return true;
        const q = search.toLowerCase();
        const student = getStudentById(a.studentId);
        const room = getRoomById(a.roomId);
        return (student?.name || '').toLowerCase().includes(q)
            || (room?.number || '').toString().toLowerCase().includes(q)
            || (student?.rollNo || '').toLowerCase().includes(q);
    });

    const avatarColor = (name) => {
        const colors = ['#C8973A', '#2D7A5F', '#4A6FA5', '#7A3A9A', '#B83A3A', '#3A7AB8'];
        let hash = 0;
        for (let c of (name || 'A')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const selectedStudentObj = getStudentById(selectedStudent);
    const selectedRoomObj = getRoomById(selectedRoom);

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-text">
                    <p className="page-eyebrow">Room Assignment</p>
                    <h1>Allocation</h1>
                    <p className="page-subtitle">
                        {allocations.length} allocated &middot;&nbsp;
                        {unallocatedStudents.length} pending &middot;&nbsp;
                        {availableRooms.length} rooms available
                    </p>
                </div>
            </div>

            <div className="allocation-layout">
                {/* Left: Assign form */}
                <div className="alloc-panel">
                    <div className="alloc-panel-header">
                        <div className="alloc-panel-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="alloc-panel-title">Assign Room</h2>
                            <p className="alloc-panel-sub">Select a student and an available room</p>
                        </div>
                    </div>

                    {error && <div className="alloc-alert alloc-alert-error">{error}</div>}
                    {success && <div className="alloc-alert alloc-alert-success">{success}</div>}

                    <div className="alloc-form">
                        <div className="form-group">
                            <label className="form-label">Student</label>
                            {unallocatedStudents.length === 0 ? (
                                <div className="alloc-no-students">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                    </svg>
                                    All students have been allocated
                                </div>
                            ) : (
                                <select className="input select" value={selectedStudent}
                                    onChange={e => setSelectedStudent(e.target.value)}>
                                    <option value="">Select an unallocated student</option>
                                    {unallocatedStudents.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}{s.rollNo ? ` — ${s.rollNo}` : ''}{s.course ? ` (${s.course})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Selected student preview */}
                        {selectedStudentObj && (
                            <div className="alloc-preview">
                                <div className="student-avatar" style={{ background: avatarColor(selectedStudentObj.name), width: 32, height: 32, fontSize: '0.85rem' }}>
                                    {(selectedStudentObj.name || '?').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                                        {selectedStudentObj.name}
                                    </p>
                                    {selectedStudentObj.preference && (
                                        <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                                            Prefers: {selectedStudentObj.preference}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Room</label>
                            {availableRooms.length === 0 ? (
                                <div className="alloc-no-students">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                                    </svg>
                                    No rooms available
                                </div>
                            ) : (
                                <select className="input select" value={selectedRoom}
                                    onChange={e => setSelectedRoom(e.target.value)}>
                                    <option value="">Select an available room</option>
                                    {availableRooms.map(r => {
                                        const occ = getOccupancy(r);
                                        const cap = r.capacity || 1;
                                        return (
                                            <option key={r.id} value={r.id}>
                                                Room {r.number} — {r.type} ({occ}/{cap} occupied){r.floor ? `, Floor ${r.floor}` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        {/* Selected room preview */}
                        {selectedRoomObj && (
                            <div className="alloc-preview alloc-preview-room">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.8">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                <div>
                                    <p style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                                        Room {selectedRoomObj.number} &middot; {selectedRoomObj.type}
                                    </p>
                                    <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                                        {getOccupancy(selectedRoomObj)}/{selectedRoomObj.capacity || 1} occupied
                                        {selectedRoomObj.floor ? ` · Floor ${selectedRoomObj.floor}` : ''}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button className="btn btn-accent alloc-submit-btn" onClick={handleAssign}
                            disabled={!selectedStudent || !selectedRoom}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" />
                                <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
                                <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
                            </svg>
                            Assign Room
                        </button>
                    </div>
                </div>

                {/* Right: Current allocations */}
                <div className="alloc-right">
                    <div className="alloc-list-header">
                        <h2 className="alloc-panel-title">Current Allocations</h2>
                        <div className="search-wrap" style={{ maxWidth: 280 }}>
                            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input className="input search-input" style={{ fontSize: '0.85rem', padding: '8px 14px 8px 34px' }}
                                placeholder="Search student or room…"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>

                    {filteredAllocations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔗</div>
                            <h3>{allocations.length === 0 ? 'No allocations yet' : 'No results'}</h3>
                            <p>{allocations.length === 0
                                ? 'Use the form to assign students to rooms.'
                                : 'Try adjusting your search.'}</p>
                        </div>
                    ) : (
                        <div className="alloc-list">
                            {filteredAllocations.map((a, i) => {
                                const student = getStudentById(a.studentId);
                                const room = getRoomById(a.roomId);
                                if (!student || !room) return null;

                                return (
                                    <div key={a.id} className="alloc-row" style={{ animationDelay: `${i * 35}ms` }}>
                                        <div className="alloc-row-student">
                                            <div className="student-avatar"
                                                style={{ background: avatarColor(student.name), width: 36, height: 36 }}>
                                                {(student.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="student-name">{student.name}</p>
                                                {student.rollNo && <p className="student-meta">{student.rollNo}</p>}
                                            </div>
                                        </div>

                                        <div className="alloc-arrow">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>

                                        <div className="alloc-row-room">
                                            <div className="alloc-room-icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                                                    Room {room.number}
                                                </p>
                                                <p className="student-meta">
                                                    {room.type}{room.floor ? ` · Floor ${room.floor}` : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <button className="btn btn-danger btn-sm alloc-remove-btn"
                                            onClick={() => onDeallocate?.(a.id)}
                                            title="Remove allocation">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}