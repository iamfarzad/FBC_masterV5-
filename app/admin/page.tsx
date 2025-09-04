"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [monitoring, setMonitoring] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, logsRes, monitoringRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/logs?level=all'),
        fetch('/api/admin/monitoring/realtime')
      ])
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      
      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData.logs || [])
      }

      if (monitoringRes.ok) {
        const monitoringData = await monitoringRes.json()
        setMonitoring(monitoringData.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Admin Dashboard - Backend Testing</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => router.push('/')} style={{ marginRight: '10px', padding: '5px 10px' }}>
          ← Back to Home
        </button>
        <button onClick={() => router.push('/chat')} style={{ padding: '5px 10px' }}>
          Go to Chat
        </button>
      </div>

      <h2>System Stats</h2>
      {stats ? (
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(stats, null, 2)}
        </pre>
      ) : (
        <p>Loading stats...</p>
      )}

      <h2>Real-time Monitoring</h2>
      {monitoring ? (
        <div style={{ background: '#f5f5f5', padding: '10px' }}>
          <p>Active Users: {monitoring.activeUsers}</p>
          <p>Requests/sec: {monitoring.requestsPerSecond}</p>
          <p>Avg Response Time: {monitoring.averageResponseTime?.toFixed(2)}ms</p>
          <p>Error Rate: {monitoring.errorRate?.toFixed(2)}%</p>
          <p>CPU Usage: {monitoring.cpuUsage?.toFixed(2)}%</p>
          <p>Memory Usage: {monitoring.memoryUsage?.toFixed(2)}%</p>
          <p>Active Connections: {monitoring.activeConnections}</p>
        </div>
      ) : (
        <p>Loading monitoring data...</p>
      )}

      <h2>Recent Logs</h2>
      {logs.length > 0 ? (
        <div style={{ background: '#f5f5f5', padding: '10px', maxHeight: '300px', overflow: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '5px', fontFamily: 'monospace', fontSize: '12px' }}>
              <span style={{ 
                color: log.level === 'error' ? 'red' : log.level === 'warning' ? 'orange' : 'green',
                fontWeight: 'bold' 
              }}>
                [{log.level.toUpperCase()}]
              </span> {log.message}
            </div>
          ))}
        </div>
      ) : (
        <p>No logs available</p>
      )}

      <h2>Quick Actions</h2>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
        <button 
          onClick={() => fetch('/api/admin/cache-cleanup').then(() => alert('Cache cleared'))}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Clear Cache
        </button>
        <button 
          onClick={fetchAdminData}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Refresh Data
        </button>
        <button 
          onClick={() => fetch('/api/admin/system-status').then(r => r.json()).then(d => alert(JSON.stringify(d, null, 2)))}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          System Status
        </button>
        <button 
          onClick={() => router.push('/admin/login')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Admin Login
        </button>
      </div>
    </div>
  )
}