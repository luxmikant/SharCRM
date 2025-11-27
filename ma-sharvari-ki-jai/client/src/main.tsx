import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate, NavLink, useNavigate } from 'react-router-dom'
import './index.css'
import { AuthProvider, useAuth } from './state/AuthContext'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Segments from './pages/Segments'
import Campaigns from './pages/Campaigns'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Button from './components/ui/Button'
import Dashboard from './pages/Dashboard'
import Insights from './pages/Insights'
import CustomerProfile from './pages/CustomerProfile'
import UserProfile from './pages/UserProfile'
import HealthDashboard from './pages/HealthDashboard'
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
  Settings,
  LogOut
} from 'lucide-react'

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { setToken } = useAuth()
  const navigate = useNavigate()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/segments', icon: Filter, label: 'Segments Builder' },
    { to: '/campaigns', icon: Megaphone, label: 'Campaigns Manager' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/insights', icon: BarChart3, label: 'Insights' },
    { to: '/health', icon: Heart, label: 'Health Scores' },
  ]

  return (
    <>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <div className="min-h-full grid grid-cols-[240px_1fr]">
        <aside className="bg-white border-r p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-purple-600" />
            <div>
              <div className="text-base font-semibold">MSKJ CRM</div>
              <div className="text-xs text-gray-500">Mini Customer Platform</div>
            </div>
          </div>
          
          {/* Quick search hint */}
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center justify-between px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>Quick search...</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-white border rounded">⌘K</kbd>
          </button>

          <nav className="flex flex-col gap-1 text-sm">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink 
                key={to}
                to={to} 
                className={({isActive}) => 
                  `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-auto space-y-1">
            <NavLink 
              to="/profile" 
              className={({isActive}) => 
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
            <Button
              variant="ghost"
              className="text-red-600 w-full justify-start px-3"
              onClick={() => {
                setToken(null)
                navigate('/', { replace: true })
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>
        <main className="p-6 bg-gray-50">{children}</main>
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
