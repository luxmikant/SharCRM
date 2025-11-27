import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../state/AuthContext'
import { apiFetch } from '../api'
import Card, { CardBody, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  RefreshCw,
  Users
} from 'lucide-react'
import { cn, getHealthScoreBadge, formatDate } from '../lib/utils'

interface HealthSummary {
  averageScore: number
  totalCustomers: number
  critical: number
  high: number
  medium: number
  low: number
  improving: number
  declining: number
  stable: number
}

interface CustomerHealth {
  _id: string
  customerId: {
    _id: string
    name: string
    email: string
    totalSpend: number
  }
  score: number
  riskLevel: string
  trend: string
  factors: {
    engagement: number
    recency: number
    frequency: number
    monetary: number
  }
  lastCalculated: string
}

export default function HealthDashboard() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<HealthSummary | null>(null)
  const [atRisk, setAtRisk] = useState<CustomerHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [summaryRes, atRiskRes] = await Promise.all([
        apiFetch<{ summary: HealthSummary }>('/api/customer-health/summary', {}, token),
        apiFetch<{ atRiskCustomers: CustomerHealth[] }>('/api/customer-health/at-risk', {}, token)
      ])
      setSummary(summaryRes.summary)
      setAtRisk(atRiskRes.atRiskCustomers)
    } catch (err) {
      console.error('Failed to fetch health data:', err)
    } finally {
      setLoading(false)
    }
  }

  const recalculateAll = async () => {
    try {
      setRecalculating(true)
      await apiFetch('/api/customer-health/recalculate', { method: 'POST' }, token)
      await fetchData()
    } catch (err) {
      console.error('Failed to recalculate:', err)
    } finally {
      setRecalculating(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    if (score >= 30) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500" />
            Customer Health Dashboard
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Monitor customer engagement and identify at-risk accounts
          </p>
        </div>
        <Button 
          onClick={recalculateAll} 
          disabled={recalculating}
          variant="secondary"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", recalculating && "animate-spin")} />
          {recalculating ? 'Recalculating...' : 'Recalculate All'}
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Score</p>
                    <p className={cn("text-3xl font-bold", getScoreColor(summary.averageScore))}>
                      {Math.round(summary.averageScore)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Tracked</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summary.totalCustomers}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">At Risk</p>
                    <p className="text-3xl font-bold text-red-600">
                      {summary.critical + summary.high}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Improving</p>
                    <p className="text-3xl font-bold text-green-600">
                      {summary.improving}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Risk Distribution */}
      {summary && (
        <Card>
          <CardHeader title="Risk Distribution" />
          <CardBody>
            <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
              {summary.low > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.low / summary.totalCustomers) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                  title={`Low Risk: ${summary.low}`}
                >
                  {summary.low}
                </motion.div>
              )}
              {summary.medium > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.medium / summary.totalCustomers) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                  title={`Medium Risk: ${summary.medium}`}
                >
                  {summary.medium}
                </motion.div>
              )}
              {summary.high > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.high / summary.totalCustomers) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                  title={`High Risk: ${summary.high}`}
                >
                  {summary.high}
                </motion.div>
              )}
              {summary.critical > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.critical / summary.totalCustomers) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                  title={`Critical: ${summary.critical}`}
                >
                  {summary.critical}
                </motion.div>
              )}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Low ({summary.low})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Medium ({summary.medium})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>High ({summary.high})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Critical ({summary.critical})</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* At-Risk Customers */}
      <Card>
        <CardHeader 
          title={`At-Risk Customers (${atRisk.length} need attention)`} 
          actions={<AlertTriangle className="w-5 h-5 text-orange-500" />}
        />
        <CardBody className="p-0">
          {atRisk.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>All customers are healthy! 🎉</p>
            </div>
          ) : (
            <div className="divide-y">
              {atRisk.map((health, idx) => {
                const badge = getHealthScoreBadge(health.score)
                return (
                  <motion.div
                    key={health._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                        badge.bg, badge.color
                      )}>
                        {health.score}
                      </div>
                      <div>
                        <p className="font-medium">{health.customerId?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{health.customerId?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Spend</p>
                        <p className="font-medium">₹{(health.customerId?.totalSpend || 0).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(health.trend)}
                        <span className="text-sm capitalize">{health.trend}</span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium capitalize",
                        health.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                        health.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      )}>
                        {health.riskLevel}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
