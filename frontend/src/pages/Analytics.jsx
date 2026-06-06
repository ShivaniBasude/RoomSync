import { useState, useEffect } from 'react'
import { getAnalytics, exportCSV } from '../api/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'

const WARM_COLORS = ['#2D6A4F', '#1B6CA8', '#D97706', '#7C3AED', '#9E2A2B', '#0891B2']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)',
      padding: '10px 16px',
      boxShadow: 'var(--sh-lg)',
    }}>
      {label && <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>}
      <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--serif)' }}>
        {payload[0]?.name ? `${payload[0].name}: ` : ''}{payload[0]?.value}
      </p>
    </div>
  )
}

function SectionCard({ title, children, action }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--sh-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 22px',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-darker)',
      }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--text)' }}>{title}</p>
        {action}
      </div>
      <div style={{ padding: '22px' }}>{children}</div>
    </div>
  )
}

export default function Analytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    try {
      const res  = await exportCSV()
      const url  = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url; link.download = 'roomsync_report.csv'
      link.click(); URL.revokeObjectURL(url)
      toast.success('Report exported!')
    } catch { toast.error('Export failed') }
  }

  if (loading) return (
    <div className="page">
      <div className="phd">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Analytics</h1>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[0,1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 110, borderRadius: 'var(--r-md)' }}/>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {[0,1].map(i => <div key={i} className="shimmer" style={{ height: 280, borderRadius: 'var(--r-md)' }}/>)}
      </div>
    </div>
  )

  if (!data) return null

  const statStrip = [
    { label: 'Total Rooms',    value: data.total_rooms,         color: '#2D6A4F' },
    { label: 'Total Students', value: data.total_students,      color: '#1B6CA8' },
    { label: 'Occupancy',      value: `${data.occupancy_rate}%`,color: '#D97706' },
    { label: 'Available Rooms',value: data.available_rooms,     color: '#0891B2' },
  ]

  return (
    <div className="page">
      <div className="phd">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Analytics</h1>
          <p className="sub">Live hostel occupancy overview and data insights</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {statStrip.map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderLeft: `4px solid ${s.color}`,
            borderRadius: 'var(--r-md)',
            padding: '18px 22px',
            boxShadow: 'var(--sh-sm)',
            animation: `fadeUp .4s var(--ease) ${i * 50}ms both`,
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', fontWeight: 400, color: 'var(--text)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>

        {/* Occupancy Donut */}
        <SectionCard title="Occupancy Rate">
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Filled',    value: data.allocated         },
                      { name: 'Available', value: data.total_capacity - data.allocated },
                    ]}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={72}
                    startAngle={90} endAngle={-270}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#2D6A4F"/>
                    <Cell fill="#EAE3D5"/>
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 400, color: 'var(--text)', lineHeight: 1 }}>
                  {data.occupancy_rate}%
                </p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>occupied</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Allocated',  value: data.allocated,                          color: '#2D6A4F' },
                { label: 'Available',  value: (data.total_capacity || 0) - data.allocated, color: '#EAE3D5', textColor: '#6B6661' },
                { label: 'Waitlisted', value: data.waitlisted || 0,                    color: '#D97706' },
              ].map(({ label, value, color, textColor }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color, border: '1px solid var(--border)', flexShrink: 0 }}/>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', flex: 1 }}>{label}</span>
                  <span style={{ fontWeight: 600, color: textColor || 'var(--text)', fontSize: '0.9rem' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Status Breakdown */}
        <SectionCard title="Students by Status">
          {data.status_breakdown?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No student data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.status_breakdown} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#6B6661', fontFamily: 'Inter' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: '#6B6661', fontFamily: 'Inter' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(data.status_breakdown || []).map((_, i) => (
                    <Cell key={i} fill={WARM_COLORS[i % WARM_COLORS.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Room Type Breakdown */}
        <SectionCard title="Rooms by Type">
          {data.room_type_breakdown?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No room data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.room_type_breakdown} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#6B6661', fontFamily: 'Inter' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: '#6B6661', fontFamily: 'Inter' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(data.room_type_breakdown || []).map((_, i) => (
                    <Cell key={i} fill={WARM_COLORS[i % WARM_COLORS.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* Year Breakdown */}
        <SectionCard title="Students by Year">
          {data.year_breakdown?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No year data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.year_breakdown} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6661', fontFamily: 'Inter' }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="year" width={90} tick={{ fontSize: 10, fill: '#6B6661', fontFamily: 'Inter' }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />}/>
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {(data.year_breakdown || []).map((_, i) => (
                    <Cell key={i} fill={WARM_COLORS[i % WARM_COLORS.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
