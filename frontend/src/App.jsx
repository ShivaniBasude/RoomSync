import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar          from './components/Navbar.jsx'
import ProtectedRoute  from './components/ProtectedRoute.jsx'
import Login           from './pages/Login.jsx'
import Register        from './pages/Register.jsx'
import Home            from './pages/Home.jsx'
import Rooms           from './pages/Rooms.jsx'
import Students        from './pages/Students.jsx'
import Allocation      from './pages/Allocation.jsx'
import Analytics       from './pages/Analytics.jsx'
import StudentPortal   from './pages/StudentPortal.jsx'

/* SVG pattern as an inline data URI — interlocking thin squares + diamond dots in brand teal */
const BG_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect x='0' y='0' width='60' height='60' fill='none'/%3E%3Crect x='10' y='10' width='16' height='16' fill='none' stroke='%232D6A4F' stroke-width='0.8'/%3E%3Crect x='34' y='34' width='16' height='16' fill='none' stroke='%232D6A4F' stroke-width='0.8'/%3E%3Crect x='34' y='10' width='16' height='16' fill='none' stroke='%232D6A4F' stroke-width='0.4'/%3E%3Crect x='10' y='34' width='16' height='16' fill='none' stroke='%232D6A4F' stroke-width='0.4'/%3E%3Ccircle cx='30' cy='30' r='1.5' fill='%232D6A4F'/%3E%3Ccircle cx='0' cy='0' r='1' fill='%232D6A4F'/%3E%3Ccircle cx='60' cy='0' r='1' fill='%232D6A4F'/%3E%3Ccircle cx='0' cy='60' r='1' fill='%232D6A4F'/%3E%3Ccircle cx='60' cy='60' r='1' fill='%232D6A4F'/%3E%3C/svg%3E")`

function AppBackground() {
  return (
    <>
      {/* Tiling SVG pattern — very subtle texture */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: BG_PATTERN,
        backgroundRepeat: 'repeat',
        backgroundSize: '60px 60px',
        opacity: 0.035,
        pointerEvents: 'none',
      }}/>

      {/* Warm amber blob — top right */}
      <div style={{
        position: 'fixed', top: -180, right: -180, zIndex: 0,
        width: 640, height: 640, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,67,0.10) 0%, rgba(212,168,67,0.04) 50%, transparent 75%)',
        pointerEvents: 'none',
      }}/>

      {/* Soft teal blob — bottom left */}
      <div style={{
        position: 'fixed', bottom: -200, left: -200, zIndex: 0,
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,106,79,0.08) 0%, rgba(45,106,79,0.03) 50%, transparent 75%)',
        pointerEvents: 'none',
      }}/>

      {/* Extra subtle amber centre-bottom warmth */}
      <div style={{
        position: 'fixed', bottom: '5%', right: '30%', zIndex: 0,
        width: 400, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(212,168,67,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
    </>
  )
}

export default function App() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const isAuth = pathname === '/login' || pathname === '/register'
  const showNav = user && !isAuth

  return (
    <>
      {/* Immersive background for all inner (authenticated) pages */}
      {!isAuth && <AppBackground />}

      {/* All content above z-index: 0 decorative layers */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {showNav && <Navbar />}
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute requireAdmin>
              <Home />
            </ProtectedRoute>
          }/>
          <Route path="/rooms" element={
            <ProtectedRoute requireAdmin>
              <Rooms />
            </ProtectedRoute>
          }/>
          <Route path="/students" element={
            <ProtectedRoute requireAdmin>
              <Students />
            </ProtectedRoute>
          }/>
          <Route path="/allocation" element={
            <ProtectedRoute requireAdmin>
              <Allocation />
            </ProtectedRoute>
          }/>
          <Route path="/analytics" element={
            <ProtectedRoute requireAdmin>
              <Analytics />
            </ProtectedRoute>
          }/>
          <Route path="/student" element={
            <ProtectedRoute>
              <StudentPortal />
            </ProtectedRoute>
          }/>
          <Route path="*" element={<Navigate to={user ? (user.role==='admin' ? '/' : '/student') : '/login'} replace />}/>
        </Routes>
      </div>
    </>
  )
}