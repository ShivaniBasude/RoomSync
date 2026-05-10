import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import Students from './pages/Students'
import Allocation from './pages/Allocation'

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <main style={{ paddingTop: 'var(--nav-height)' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/allocation" element={<Allocation />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}