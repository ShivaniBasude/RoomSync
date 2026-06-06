import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token     = localStorage.getItem('rs_token')
    const savedUser = localStorage.getItem('rs_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      getMe()
        .then(res => { setUser(res.data); localStorage.setItem('rs_user', JSON.stringify(res.data)) })
        .catch(() => { localStorage.removeItem('rs_token'); localStorage.removeItem('rs_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('rs_token', token)
    localStorage.setItem('rs_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('rs_token')
    localStorage.removeItem('rs_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout,
      isAdmin:   user?.role === 'admin',
      isStudent: user?.role === 'student',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
