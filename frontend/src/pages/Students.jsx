/* Students.jsx */
import { useState } from 'react';
import './Students.css';

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const PREFS = ['Single', 'Double', 'Triple', 'No preference'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

const EMPTY_FORM = {
    name: '', rollNo: '', course: '', year: '',
    gender: '', preference: '', phone: '', email: '',
};

export default function Students({ students = [], allocations = [], onAdd, onEdit, onDelete }) {
    const [showForm, setShowForm] = useState(false);
    const [editStudent, setEdit] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [search, setSearch] = useState('');
    const [filterStatus, setStatus] = useState('all');
    const [errors, setErrors] = useState({});

    const isAllocated = (s) => allocations.some(a => a.studentId === s.id);

    const filtered = students.filter(s => {
        if (filterStatus === 'allocated' && !isAllocated(s)) return false;
        if (filterStatus === 'unallocated' && isAllocated(s)) return false;
        if (search) {
            const q = search.toLowerCase();
            return (s.name || '').toLowerCase().includes(q)
                || (s.rollNo || '').toLowerCase().includes(q)
                || (s.course || '').toLowerCase().includes(q);
        }
        return true;
    });

    const openAdd = () => {
        setEdit(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setShowForm(true);
    };

    const openEdit = (s) => {
        setEdit(s);
        setForm({
            name: s.name || '', rollNo: s.rollNo || '', course: s.course || '',
            year: s.year || '', gender: s.gender || '', preference: s.preference || '',
            phone: s.phone || '', email: s.email || ''
        });
        setErrors({});
        setShowForm(true);
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        if (editStudent) {
            onEdit?.({ ...editStudent, ...form });
        } else {
            onAdd?.({ ...form, id: Date.now() });
        }
        setShowForm(false);
    };

    const field = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const genderInitial = (g) => {
        if (!g) return '?';
        return g.charAt(0).toUpperCase();
    };

    const avatarColor = (name) => {
        const colors = ['#C8973A', '#2D7A5F', '#4A6FA5', '#7A3A9A', '#B83A3A', '#3A7AB8'];
        let hash = 0;
        for (let c of (name || 'A')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="page-wrapper">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-text">
                    <p className="page-eyebrow">Records</p>
                    <h1>Students</h1>
                    <p className="page-subtitle">
                        {students.length} student{students.length !== 1 ? 's' : ''} &middot;&nbsp;
                        {students.filter(isAllocated).length} allocated
                    </p>
                </div>
                <button className="btn btn-accent" onClick={openAdd}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Student
                </button>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-card modal-wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>{editStudent ? 'Edit Student' : 'Add New Student'}</h2>
                                <p className="modal-subtitle">Fill in the student's details below</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-section-label">Personal Information</div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className={`input ${errors.name ? 'input-error' : ''}`}
                                        placeholder="e.g. Priya Sharma"
                                        value={form.name} onChange={e => field('name', e.target.value)} />
                                    {errors.name && <p className="field-error">{errors.name}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Roll Number</label>
                                    <input className="input" placeholder="e.g. CS2023001"
                                        value={form.rollNo} onChange={e => field('rollNo', e.target.value)} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select className="input select" value={form.gender}
                                        onChange={e => field('gender', e.target.value)}>
                                        <option value="">Select gender</option>
                                        {GENDERS.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year</label>
                                    <select className="input select" value={form.year}
                                        onChange={e => field('year', e.target.value)}>
                                        <option value="">Select year</option>
                                        {YEARS.map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-section-label" style={{ marginTop: 'var(--space-2)' }}>
                                Academic & Contact
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Course / Department</label>
                                    <input className="input" placeholder="e.g. B.Tech Computer Science"
                                        value={form.course} onChange={e => field('course', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Room Preference</label>
                                    <select className="input select" value={form.preference}
                                        onChange={e => field('preference', e.target.value)}>
                                        <option value="">Select preference</option>
                                        {PREFS.map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className={`input ${errors.email ? 'input-error' : ''}`}
                                        type="email" placeholder="student@college.edu"
                                        value={form.email} onChange={e => field('email', e.target.value)} />
                                    {errors.email && <p className="field-error">{errors.email}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="input" placeholder="+91 98765 43210"
                                        value={form.phone} onChange={e => field('phone', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            <button className="btn btn-accent" onClick={handleSubmit}>
                                {editStudent ? 'Save Changes' : 'Add Student'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="rooms-toolbar">
                <div className="search-wrap">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input className="input search-input" placeholder="Search by name, roll number, or course…"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filter-tabs">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'allocated', label: 'Allocated' },
                        { key: 'unallocated', label: 'Unallocated' },
                    ].map(f => (
                        <button key={f.key}
                            className={`filter-tab ${filterStatus === f.key ? 'active' : ''}`}
                            onClick={() => setStatus(f.key)}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    <h3>{students.length === 0 ? 'No students yet' : 'No results'}</h3>
                    <p>{students.length === 0
                        ? 'Add your first student to get started.'
                        : 'Try adjusting your search or filter.'}</p>
                    {students.length === 0 && (
                        <button className="btn btn-accent" onClick={openAdd}>Add Student</button>
                    )}
                </div>
            ) : (
                <div className="students-table-wrap card">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Roll No.</th>
                                <th>Course</th>
                                <th>Year</th>
                                <th>Room Pref.</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, i) => {
                                const allocated = isAllocated(s);
                                const color = avatarColor(s.name);
                                return (
                                    <tr key={s.id} style={{ animationDelay: `${i * 30}ms` }}>
                                        <td>
                                            <div className="student-identity">
                                                <div className="student-avatar" style={{ background: color }}>
                                                    {genderInitial(s.name)}
                                                </div>
                                                <div>
                                                    <p className="student-name">{s.name || '—'}</p>
                                                    {s.email && <p className="student-meta">{s.email}</p>}
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
                                            <span className={`badge ${allocated ? 'badge-success' : 'badge-warning'}`}>
                                                {allocated ? 'Allocated' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="student-actions">
                                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => onDelete?.(s.id)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14H6L5 6" />
                                                        <path d="M10 11v6M14 11v6" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}