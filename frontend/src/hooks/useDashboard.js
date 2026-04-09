import { useEffect, useState } from 'react'
import useSocket from './useSocket'

// ─────────────────────────────────────────
// useDashboard — uses mock socket data
// No axios needed for mock version
// ─────────────────────────────────────────
const useDashboard = () => {
  const { connected, dashboardData } = useSocket()

  const [classScore,      setClassScore]      = useState(null)
  const [classHistory,    setClassHistory]    = useState([])
  const [trend,           setTrend]           = useState(null)
  const [breakdown,       setBreakdown]       = useState({ engaged: 0, struggling: 0, distressed: 0, total: 0 })
  const [recommendations, setRecommendations] = useState([])
  const [students,        setStudents]        = useState([])
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    if (!dashboardData) return
    setLoading(false)
    setClassScore(dashboardData.classScore)
    setClassHistory(dashboardData.classScoreHistory || [])
    setTrend(dashboardData.trend)
    setBreakdown(dashboardData.breakdown || { engaged: 0, struggling: 0, distressed: 0, total: 0 })
    setRecommendations(dashboardData.recommendations || [])
    setStudents(dashboardData.students || [])
  }, [dashboardData])

  return {
    connected,
    classScore,
    classHistory,
    trend,
    breakdown,
    recommendations,
    students,
    loading
  }
}

export default useDashboard