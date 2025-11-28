import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function truncate(str: string, length: number): string {
  if (!str) return ''
  return str.length > length ? `${str.substring(0, length)}...` : str
}

// Customer Health Score Calculations
export function calculateHealthScore(customer: any): number {
  let score = 50 // Base score
  
  // Recency factor (max +25 or -20)
  if (customer.lastOrderDate) {
    const daysSinceLastOrder = Math.floor(
      (Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLastOrder < 7) score += 25
    else if (daysSinceLastOrder < 30) score += 15
    else if (daysSinceLastOrder < 90) score += 5
    else score -= 20
  }
  
  // Monetary factor (max +15)
  if (customer.totalSpend > 10000) score += 15
  else if (customer.totalSpend > 5000) score += 10
  else if (customer.totalSpend > 1000) score += 5
  
  // Frequency factor (max +10)
  if (customer.visitCount > 10) score += 10
  else if (customer.visitCount > 5) score += 5
  
  return Math.max(0, Math.min(100, score))
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-700 border-green-200'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (score >= 40) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'At Risk'
  return 'Critical'
}

export function getHealthScoreBadge(score: number): { color: string; bg: string; label: string } {
  if (score >= 80) return { color: 'text-green-700', bg: 'bg-green-100', label: 'Excellent' }
  if (score >= 60) return { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Good' }
  if (score >= 40) return { color: 'text-orange-700', bg: 'bg-orange-100', label: 'At Risk' }
  return { color: 'text-red-700', bg: 'bg-red-100', label: 'Critical' }
}

export function getHealthScoreGradient(score: number): string {
  if (score >= 80) return 'from-green-400 to-emerald-500'
  if (score >= 60) return 'from-yellow-400 to-amber-500'
  if (score >= 40) return 'from-orange-400 to-orange-500'
  return 'from-red-400 to-red-500'
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount)
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Generate random color for avatars
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}
