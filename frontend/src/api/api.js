import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('rs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rs_token')
      localStorage.removeItem('rs_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const login    = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const getMe    = ()     => api.get('/auth/me')

// Rooms
export const getRooms    = ()         => api.get('/rooms')
export const createRoom  = (data)     => api.post('/rooms', data)
export const updateRoom  = (id, data) => api.put(`/rooms/${id}`, data)
export const deleteRoom  = (id)       => api.delete(`/rooms/${id}`)

// Students
export const getStudents    = ()         => api.get('/students')
export const getMyStudent   = ()         => api.get('/students/me')
export const createStudent  = (data)     => api.post('/students', data)
export const updateStudent  = (id, data) => api.put(`/students/${id}`, data)
export const deleteStudent  = (id)       => api.delete(`/students/${id}`)

// Allocations
export const getAllocations    = ()         => api.get('/allocations')
export const createAllocation  = (data)     => api.post('/allocations', data)
export const deleteAllocation  = (id)       => api.delete(`/allocations/${id}`)

// Requests
export const getRequests    = ()         => api.get('/requests')
export const getMyRequests  = ()         => api.get('/requests/me')
export const createRequest  = (data)     => api.post('/requests', data)
export const updateRequest  = (id, data) => api.put(`/requests/${id}`, data)

// Waitlist
export const getWaitlist         = ()    => api.get('/waitlist')
export const addToWaitlist       = (id)  => api.post(`/waitlist/${id}`)
export const removeFromWaitlist  = (id)  => api.delete(`/waitlist/${id}`)

// Notifications
export const getNotifications  = ()    => api.get('/notifications')
export const markRead          = (id)  => api.put(`/notifications/${id}/read`)
export const markAllRead       = ()    => api.put('/notifications/read-all')

// Analytics
export const getAnalytics  = ()  => api.get('/analytics/summary')
export const exportCSV     = ()  => api.get('/analytics/export/csv', { responseType: 'blob' })

export default api
