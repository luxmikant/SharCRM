/**
 * SharCRM Dashboard - Real-time KPIs and Analytics
 * @version 2.0.0
 */
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, ShoppingCart, DollarSign, Target, Activity, ArrowUpRight,
  ChevronRight, Clock, Mail, Send, CheckCircle2, XCircle, TrendingUp,
  BarChart3, PieChart, Calendar, Sparkles, Bell, ArrowUp, ArrowDown,
  Eye, MousePointer, Megaphone, UserPlus, Package
} from 'lucide-react'
import { apiFetch } from '../api'
import { useAuth } from '../state/AuthContext'
import { StatsCard } from '../components/ui/StatsCard'
import { SkeletonStats, SkeletonChart, SkeletonTable } from '../components/ui/Skeleton'
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

type KPIs = {
  customers: number
  orders: number
  revenue: number
  revenue30d: number
  activeCampaigns: number
  totalCampaigns: number
}

type Campaign = {
  _id: string
  name: string
  status: string
  channel: string
  createdAt: string
  metrics?: {
    SENT?: number
    DELIVERED?: number
    OPENED?: number
    CLICKED?: number
    FAILED?: number
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    running: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
    completed: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
    scheduled: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
    failed: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
    draft: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' }
  }
  
  const style = config[status] || config.draft
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// Quick action button
function QuickAction({ icon: Icon, label, onClick, gradient }: {
  icon: React.ElementType
  label: string
  onClick?: () => void
  gradient: string
}) {
  return (
    <motion.button
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-lg transition-all"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </motion.button>
  )
}

// Activity item component
function ActivityItem({ 
  icon: Icon, 
  title, 
  subtitle, 
  time, 
  iconBg 
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  time: string
  iconBg: string
}) {
  return (
    <motion.div 
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </motion.div>
  )
}

export default function Dashboard() {
  const { token } = useAuth()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [activity, setActivity] = useState<any>(null)
  const [perf, setPerf] = useState<any[]>([])
  const [dashCampaigns, setDashCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [k, a, p, dc] = await Promise.all([
          apiFetch<{ success: boolean; data: any }>('/api/dashboard/kpis', {}, token),
          apiFetch<{ success: boolean; data: any }>('/api/dashboard/recent-activity?limit=10', {}, token),
          apiFetch<{ success: boolean; data: any }>('/api/dashboard/campaign-performance?days=60', {}, token),
          apiFetch<{ success: boolean; data: any }>('/api/dashboard/campaigns?limit=5', {}, token),
        ])
        if (!cancelled) {
          setKpis(k?.data ?? null)
          setActivity(a?.data ?? null)
          const perfData = Array.isArray(p?.data)
            ? p.data
            : (Array.isArray(p?.data?.performance) ? p.data.performance : [])
          setPerf(perfData)
          const dcData = dc?.data
          const campaigns = Array.isArray(dcData?.campaigns)
            ? dcData.campaigns
            : (Array.isArray(dcData) ? dcData : [])
          setDashCampaigns(campaigns)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  // Generate sparkline data
  const generateSparkline = (base: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.floor(base * (0.7 + Math.random() * 0.6))
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonTable rows={5} />
      </div>
    )
  }

  // Chart data from performance
  const chartData = perf.slice(0, 7).map((p, i) => ({
    name: p.name?.substring(0, 10) || `Day ${i + 1}`,
    sent: p.metrics?.SENT || 0,
    delivered: p.metrics?.DELIVERED || 0,
    opened: p.metrics?.OPENED || 0,
    clicked: p.metrics?.CLICKED || 0
  }))

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        variants={item}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your campaigns.</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTimeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={item}
      >
        <StatsCard
          title="Total Customers"
          value={kpis?.customers ?? 0}
          change={12}
          icon={Users}
          gradient="from-violet-500 to-purple-600"
          sparklineData={generateSparkline(kpis?.customers ?? 100)}
        />
        <StatsCard
          title="Total Orders"
          value={kpis?.orders ?? 0}
          change={8}
          icon={ShoppingCart}
          gradient="from-blue-500 to-cyan-500"
          sparklineData={generateSparkline(kpis?.orders ?? 50)}
        />
        <StatsCard
          title="Revenue (30d)"
          value={kpis?.revenue30d ?? 0}
          change={23}
          prefix="$"
          icon={DollarSign}
          gradient="from-emerald-500 to-teal-500"
          formatValue={(v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          sparklineData={generateSparkline(kpis?.revenue30d ?? 1000)}
        />
        <StatsCard
          title="Active Campaigns"
          value={kpis?.activeCampaigns ?? 0}
          change={-5}
          icon={Target}
          gradient="from-orange-500 to-amber-500"
          changeLabel="vs last week"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="p-6 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 rounded-2xl border border-violet-100"
        variants={item}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction 
            icon={Target} 
            label="New Campaign" 
            gradient="from-violet-500 to-purple-600" 
          />
          <QuickAction 
            icon={Users} 
            label="Add Segment" 
            gradient="from-blue-500 to-cyan-500" 
          />
          <QuickAction 
            icon={Mail} 
            label="Send Email" 
            gradient="from-emerald-500 to-teal-500" 
          />
          <QuickAction 
            icon={BarChart3} 
            label="View Reports" 
            gradient="from-orange-500 to-amber-500" 
          />
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={item}
      >
        {/* Campaign Performance Chart */}
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Campaign Performance</h3>
              <p className="text-sm text-gray-500">Last 7 campaigns overview</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-gray-600">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Delivered</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#8b5cf6" 
                  fill="url(#sentGradient)" 
                  strokeWidth={2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="delivered" 
                  stroke="#10b981" 
                  fill="url(#deliveredGradient)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Engagement Rate</h3>
              <p className="text-sm text-gray-500">Opens & Clicks breakdown</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Bar dataKey="opened" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicked" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-violet-500" />
              <span className="text-gray-600">Opened</span>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-cyan-500" />
              <span className="text-gray-600">Clicked</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Campaigns & Activity */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={item}
      >
        {/* Recent Campaigns */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Recent Campaigns</h3>
            <motion.button 
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
              whileHover={{ x: 4 }}
            >
              View all <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {dashCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign._id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 group-hover:scale-110 transition-transform">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{campaign.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs">
                        {campaign.channel}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={campaign.status} />
                  <div className="text-right hidden sm:block">
                    {campaign.metrics && (
                      <div className="text-sm">
                        <span className="text-gray-900 font-medium">
                          {campaign.metrics.DELIVERED || 0}
                        </span>
                        <span className="text-gray-400"> / {campaign.metrics.SENT || 0}</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500">Delivered</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Activity Feed</h3>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {/* Recent Orders */}
            {(Array.isArray(activity?.recentOrders) ? activity.recentOrders.slice(0, 3) : []).map((o: any, i: number) => (
              <ActivityItem
                key={`order-${i}`}
                icon={Package}
                title={`Order #${o.externalOrderId}`}
                subtitle={`$${o.orderTotal?.toFixed(2)} • ${o.status}`}
                time="Just now"
                iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
              />
            ))}
            
            {/* New Customers */}
            {(Array.isArray(activity?.recentCustomers) ? activity.recentCustomers.slice(0, 3) : []).map((c: any, i: number) => (
              <ActivityItem
                key={`customer-${i}`}
                icon={UserPlus}
                title={c.name}
                subtitle="New customer joined"
                time="2h ago"
                iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
              />
            ))}
            
            {/* Recent Campaigns */}
            {(Array.isArray(activity?.recentCampaigns) ? activity.recentCampaigns.slice(0, 2) : []).map((c: any, i: number) => (
              <ActivityItem
                key={`campaign-${i}`}
                icon={Megaphone}
                title={c.name}
                subtitle={`Campaign ${c.status}`}
                time="4h ago"
                iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Performance Table */}
      <motion.div 
        className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
        variants={item}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Campaign Performance (60d)</h3>
            <p className="text-sm text-gray-500">Detailed metrics for all campaigns</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-sm font-medium text-gray-500">Campaign</th>
                <th className="pb-4 text-sm font-medium text-gray-500">Status</th>
                <th className="pb-4 text-sm font-medium text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Send className="w-4 h-4" /> Sent
                  </div>
                </th>
                <th className="pb-4 text-sm font-medium text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Delivered
                  </div>
                </th>
                <th className="pb-4 text-sm font-medium text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4" /> Opened
                  </div>
                </th>
                <th className="pb-4 text-sm font-medium text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MousePointer className="w-4 h-4" /> Clicked
                  </div>
                </th>
                <th className="pb-4 text-sm font-medium text-gray-500 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <XCircle className="w-4 h-4" /> Failed
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {perf.map((r: any, index: number) => (
                <motion.tr 
                  key={r.campaignId}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-100">
                        <Megaphone className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="font-medium text-gray-900">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-4 text-center font-medium">{r.metrics?.SENT ?? 0}</td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      {r.metrics?.DELIVERED ?? 0}
                      {r.metrics?.SENT > 0 && (
                        <span className="text-xs text-gray-400">
                          ({Math.round((r.metrics?.DELIVERED / r.metrics?.SENT) * 100)}%)
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-4 text-center font-medium text-violet-600">{r.metrics?.OPENED ?? 0}</td>
                  <td className="py-4 text-center font-medium text-cyan-600">{r.metrics?.CLICKED ?? 0}</td>
                  <td className="py-4 text-center">
                    <span className={`font-medium ${(r.metrics?.FAILED ?? 0) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {r.metrics?.FAILED ?? 0}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Revenue Summary Card */}
      <motion.div 
        className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl text-white relative overflow-hidden"
        variants={item}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <h2 className="text-4xl font-bold mt-1">
                ${kpis?.revenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '0.00'}
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  +18.5%
                </span>
                <span className="text-gray-400 text-sm">vs previous period</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-3xl font-bold">{kpis?.totalCampaigns ?? 0}</div>
                <div className="text-gray-400 text-sm">Total Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{kpis?.customers ?? 0}</div>
                <div className="text-gray-400 text-sm">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{kpis?.orders ?? 0}</div>
                <div className="text-gray-400 text-sm">Orders</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
