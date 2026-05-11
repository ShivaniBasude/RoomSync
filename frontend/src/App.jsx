// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Rooms from './pages/Rooms.jsx'
import Students from './pages/Students.jsx'
import Allocation from './pages/Allocation.jsx'

export default function App() {
    const [rooms, setRooms] = useState([])
    const [students, setStudents] = useState([])
    const [allocations, setAllocations] = useState([])

    // Rooms
    const addRoom = (r) => setRooms(p => [...p, { ...r, id: Date.now() }])
    const editRoom = (r) => setRooms(p => p.map(x => x.id === r.id ? r : x))
    const deleteRoom = (id) => {
        setRooms(p => p.filter(x => x.id !== id))
        setAllocations(p => p.filter(a => a.roomId !== id))
    }

    // Students
    const addStudent = (s) => setStudents(p => [...p, { ...s, id: Date.now() }])
    const editStudent = (s) => setStudents(p => p.map(x => x.id === s.id ? s : x))
    const deleteStudent = (id) => {
        setStudents(p => p.filter(x => x.id !== id))
        setAllocations(p => p.filter(a => a.studentId !== id))
    }

    // Allocations
    const allocate = (a) => setAllocations(p => [...p, { ...a, id: Date.now() }])
    const deallocate = (id) => setAllocations(p => p.filter(a => a.id !== id))

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