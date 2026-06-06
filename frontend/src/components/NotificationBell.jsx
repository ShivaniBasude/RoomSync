import { useState, useEffect, useRef } from 'react'
import { getNotifications, markRead, markAllRead } from '../api/api'

export default function NotificationBell() {
  const [notifs, setNotifs] = useState([])
  const [open,   setOpen]   = useState(false)
  const ref = useRef()

  const load = () => getNotifications().then(r => setNotifs(r.data)).catch(() => {})
  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleRead = async (id) => {
    await markRead(id)
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 38, height: 38, borderRadius: 'var(--r-sm)',
        background: open ? 'var(--bg-darker)' : 'transparent',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--text-muted)', position: 'relative',
        transition: 'all 150ms',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 0 2px var(--surface)',
          }}/>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 46, width: 320, zIndex: 1100,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-lg)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--bg-darker)',
          }}>
            <p style={{ fontFamily: 'var(--sans)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
              Notifications
            </p>
            {unread > 0 && (
              <button onClick={() => { markAllRead(); setNotifs(p => p.map(n => ({ ...n, read: true }))) }}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <p style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No notifications
              </p>
            ) : notifs.slice(0, 10).map(n => (
              <div key={n.id} onClick={() => handleRead(n.id)} style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                background: n.read ? 'transparent' : 'var(--bg-darker)',
                transition: 'background 150ms',
              }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.4, fontWeight: n.read ? 400 : 500 }}>
                  {n.message}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
