import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { AnimatedCounter } from './AnimatedCounter'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface StatsCardProps {
  title: string
  value: number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  gradient: string
  prefix?: string
  suffix?: string
  sparklineData?: Array<{ value: number }>
  formatValue?: (value: number) => string
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon: Icon,
  gradient,
  prefix = '',
  suffix = '',
  sparklineData,
  formatValue = (v) => v.toLocaleString()
}: StatsCardProps) {
  const isPositive = change && change > 0
  
  return (
    <motion.div
      className="relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        borderColor: "rgba(168, 85, 247, 0.3)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient Background - visible on hover */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} 
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <motion.div 
            className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
        </div>
        
        {/* Value with Animation */}
        <div className="text-3xl font-bold text-gray-900 mb-3">
          {prefix}
          <AnimatedCounter value={value} formatValue={formatValue} />
          {suffix}
        </div>
        
        {/* Change Indicator */}
        {change !== undefined && (
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium
              ${isPositive 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
              }
            `}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-sm text-gray-400">{changeLabel}</span>
          </motion.div>
        )}
      </div>
      
      {/* Sparkline Chart */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Decorative Corner Element */}
      <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
    </motion.div>
  )
}

// Compact version for grid layouts
export function StatsCardCompact({
  title,
  value,
  icon: Icon,
  gradient,
  prefix = '',
  suffix = ''
}: Omit<StatsCardProps, 'sparklineData' | 'change' | 'changeLabel'>) {
  return (
    <motion.div
      className="relative p-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs text-gray-500">{title}</div>
          <div className="text-lg font-bold text-gray-900">
            {prefix}<AnimatedCounter value={value} />{suffix}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard
