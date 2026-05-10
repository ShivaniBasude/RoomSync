/* ViewStudents.jsx — Reusable student table/list */
import './ViewStudents.css';

export default function ViewStudents({ students = [], onEdit, onDelete }) {
    if (students.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <h3>No students found</h3>
                <p>Add a student to get started.</p>
            </div>
        );
    }

    const avatarColor = (name) => {
        const colors = ['#C8973A', '#2D7A5F', '#4A6FA5', '#7A3A9A', '#B83A3A', '#3A7AB8'];
        let hash = 0;
        for (let c of (name || 'A')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="students-table-wrap card">
            <table className="students-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Roll No.</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th>Room</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((s, i) => (
                        <tr key={s.id} style={{ animationDelay: `${i * 30}ms` }}>
                            <td>
                                <div className="student-identity">
                                    <div className="student-avatar" style={{ background: avatarColor(s.name) }}>
                                        {(s.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="student-name">{s.name || '—'}</p>
                                        {s.gender && <p className="student-meta">{s.gender}</p>}
                                    </div>
                                </div>
                            </td>
                            <td className="td-mono">{s.rollNo || <span className="td-empty">—</span>}</td>
                            <td>{s.course || <span className="td-empty">—</span>}</td>
                            <td>{s.year || <span className="td-empty">—</span>}</td>
                            <td>
                                {s.preference
                                    ? <span className="badge badge-muted">{s.preference}</span>
                                    : <span className="td-empty">—</span>}
                            </td>
                            <td>
                                <div className="student-actions">
                                    {onEdit && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(s)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(s.id)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
                                            </svg>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}