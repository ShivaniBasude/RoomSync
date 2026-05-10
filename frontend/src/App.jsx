/* App.jsx */
import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import Students from './pages/Students'
import Allocation from './pages/Allocation'

export default function App() {
    const [rooms, setRooms] = useState([])
    const [students, setStudents] = useState([])
    const [allocations, setAllocations] = useState([])

    /* ── Rooms ───────────────────────────────────── */
    const addRoom = (r) => setRooms(prev => [...prev, r])
    const editRoom = (r) => setRooms(prev => prev.map(x => x.id === r.id ? r : x))
    const deleteRoom = (id) => {
        setRooms(prev => prev.filter(x => x.id !== id))
        setAllocations(prev => prev.filter(a => a.roomId !== id))
    }

    /* ── Students ────────────────────────────────── */
    const addStudent = (s) => setStudents(prev => [...prev, s])
    const editStudent = (s) => setStudents(prev => prev.map(x => x.id === s.id ? s : x))
    const deleteStudent = (id) => {
        setStudents(prev => prev.filter(x => x.id !== id))
        setAllocations(prev => prev.filter(a => a.studentId !== id))
    }

    /* ── Allocations ─────────────────────────────── */
    const allocate = (a) => setAllocations(prev => [...prev, a])
    const deallocate = (id) => setAllocations(prev => prev.filter(a => a.id !== id))

    const shared = { rooms, students, allocations }

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home      {...shared} />} />
                <Route path="/rooms" element={<Rooms     {...shared} onAdd={addRoom} onEdit={editRoom} onDelete={deleteRoom} />} />
                <Route path="/students" element={<Students  {...shared} onAdd={addStudent} onEdit={editStudent} onDelete={deleteStudent} />} />
                <Route path="/allocation" element={<Allocation {...shared} onAllocate={allocate} onDeallocate={deallocate} />} />
            </Routes>
        </>
    )
}