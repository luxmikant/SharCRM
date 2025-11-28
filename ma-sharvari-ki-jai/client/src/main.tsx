/**
 * SharCRM - Main Application Entry Point
 * 
 * A modern CRM platform built with React 18, Vite, and Tailwind CSS.
 * Features AI-powered insights, customer segmentation, and campaign management.
 * 
 * @version 2.0.0
 * @author SharCRM Team
 */
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import { AuthProvider, useAuth } from './state/AuthContext'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Segments from './pages/Segments'
import Campaigns from './pages/Campaigns'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import { Button } from './components/ui/Button'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'
import CustomerProfile from './pages/CustomerProfile'
import UserProfile from './pages/UserProfile'
import HealthDashboard from './pages/HealthDashboard'
import Sales from './pages/Sales'
import Debug from './pages/Debug'
import { CampaignBuilder } from './components/CampaignBuilder'
import { ToastProvider } from './components/ui/Toast'
import CommandPalette from './components/CommandPalette'
import { 
  LayoutDashboard, 
  Filter, 
  Megaphone, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronLeft,
  Sparkles,
  Menu
} from 'lucide-react'

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications] = useState(3)

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-brand-400 to-brand-500' },
    { to: '/segments', icon: Filter, label: 'Segments', color: 'from-brand-500 to-brand-600' },
    { to: '/campaigns', icon: Megaphone, label: 'Campaigns', color: 'from-accent-500 to-accent-600' },
    { to: '/customers', icon: Users, label: 'Customers', color: 'from-brand-400 to-brand-500' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders', color: 'from-accent-400 to-accent-500' },
    { to: '/insights', icon: BarChart3, label: 'Analytics', color: 'from-brand-500 to-brand-700' },
    { to: '/health', icon: Heart, label: 'Health Scores', color: 'from-accent-500 to-accent-700' },
    { to: '/sales', icon: TrendingUp, label: 'Sales Pipeline', color: 'from-brand-400 to-accent-500' },
  ]

  const currentPage = navItems.find(item => location.pathname.startsWith(item.to))?.label || 'Dashboard'

  return (
    <>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation Bar - Glass Morphism */}
        <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: Menu & Breadcrumb */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">SharCRM</span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-900">{currentPage}</span>
              </div>
            </div>
            
            {/* Center: Search */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-gray-100/80 hover:bg-gray-100 rounded-xl transition-all w-80"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 flex-1 text-left">Search anything...</span>
              <kbd className="px-2 py-1 bg-white rounded-lg text-xs text-gray-400 border border-gray-200">⌘K</kbd>
            </motion.button>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                    {notifications}
                  </span>
                )}
              </motion.button>
              
              {/* User Menu */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-yellow-400 flex items-center justify-center text-gray-900 font-medium text-sm">
                  U
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">User</span>
              </motion.button>
            </div>
          </div>
        </header>

        <div className="flex pt-16">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: sidebarCollapsed ? 80 : 260 }}
            className="fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200/50 z-30 hidden lg:block overflow-hidden"
          >
            <div className="flex flex-col h-full p-4">
              {/* Logo */}
              <div className="flex items-center gap-3 px-3 py-2 mb-6">
                <motion.div 
                  className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-brand-300/30 flex-shrink-0"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect width="50" height="50" rx="10" fill="#CCFF00"/>
                    <rect x="5" y="5" width="40" height="40" rx="8" stroke="#000" strokeWidth="2.5" fill="none"/>
                    <path d="M5 25 Q25 8 45 25 Q25 42 5 25" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </motion.div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <div className="font-bold text-gray-900 tracking-tight">SHARCRM</div>
                      <div className="text-xs text-brand-600">Enterprise</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Collapse Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </motion.div>
              </motion.button>

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                {navItems.map(({ to, icon: Icon, label, color }) => {
                  const isActive = location.pathname.startsWith(to)
                  return (
                    <NavLink key={to} to={to}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                          ${isActive 
                            ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                        `}
                      >
                        <div className={`
                          w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isActive ? 'bg-white/20' : 'bg-gray-100'}
                        `}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="font-medium text-sm"
                            >
                              {label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </NavLink>
                  )
                })}
              </nav>
              
              {/* Bottom Actions */}
              <div className="space-y-1 pt-4 border-t border-gray-100">
                <NavLink to="/profile">
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                      ${location.pathname === '/profile' ? 'bg-gray-100' : 'hover:bg-gray-100'}
                    `}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Settings className="w-5 h-5 text-gray-500" />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium text-gray-600">Settings</span>
                    )}
                  </motion.div>
                </NavLink>
                
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setToken(null)
                    navigate('/', { replace: true })
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">Logout</span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={false}
            animate={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
            className="flex-1 min-h-[calc(100vh-4rem)] p-6 lg:ml-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.main>
        </div>
      </div>
    </>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/dashboard', element: <Protected><AppLayout><Dashboard /></AppLayout></Protected> },
  { path: '/segments', element: <Protected><AppLayout><Segments /></AppLayout></Protected> },
  { path: '/campaigns', element: <Protected><AppLayout><Campaigns /></AppLayout></Protected> },
  { path: '/campaigns/new', element: <Protected><AppLayout><CampaignBuilder /></AppLayout></Protected> },
  { path: '/customers', element: <Protected><AppLayout><Customers /></AppLayout></Protected> },
  { path: '/customers/:id', element: <Protected><AppLayout><CustomerProfile /></AppLayout></Protected> },
  { path: '/orders', element: <Protected><AppLayout><Orders /></AppLayout></Protected> },
  { path: '/insights', element: <Protected><AppLayout><Insights /></AppLayout></Protected> },
  { path: '/insights/*', element: <Protected><AppLayout><Insights /></AppLayout></Protected> },
  { path: '/health', element: <Protected><AppLayout><HealthDashboard /></AppLayout></Protected> },
  { path: '/sales', element: <Protected><AppLayout><Sales /></AppLayout></Protected> },
  { path: '/profile', element: <Protected><AppLayout><UserProfile /></AppLayout></Protected> },
  { path: '/debug', element: <Debug /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
)
