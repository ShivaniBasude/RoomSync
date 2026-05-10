/* ViewStudents.jsx — Reusable student table/list */
import './ViewStudents.css'

export default function ViewStudents({ students = [], onEdit, onDelete }) {
    if (students.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <p className="empty-state-text">No students found. Add a student to get started.</p>
            </div>
        )
    }

    return (
        <div className="students-table-wrap card" style={{ overflow: 'hidden' }}>
            <table className="rs-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Roll No.</th>
                        <th>Course</th>
                        <th>Year</th>
                        <th>Room</th>
                        <th>Status</th>
                        {(onEdit || onDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id || student.roll_no} className="fade-in">
                            <td>
                                <div className="student-name-cell">
                                    <span className="student-avatar">
                                        {(student.name || '?')[0].toUpperCase()}
                                    </span>
                                    {student.name}
                                </div>
                            </td>
                            <td>{student.roll_no || '—'}</td>
                            <td>{student.course || '—'}</td>
                            <td>{student.year ? `Year ${student.year}` : '—'}</td>
                            <td>
                                {student.room_number
                                    ? <span className="badge badge-teal">Room {student.room_number}</span>
                                    : <span className="badge badge-ink">Unassigned</span>
                                }
                            </td>
                            <td>
                                <span className={`badge ${student.room_number ? 'badge-green' : 'badge-gold'}`}>
                                    {student.room_number ? 'Allocated' : 'Pending'}
                                </span>
                            </td>
                            {(onEdit || onDelete) && (
                                <td>
                                    <div className="student-actions">
                                        {onEdit && (
                                            <button className="btn btn-outline btn-sm" onClick={() => onEdit(student)}>
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button className="btn btn-danger btn-sm" onClick={() => onDelete(student)}>
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}