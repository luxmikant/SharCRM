import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Target, 
  BarChart3, 
  Settings, 
  Search,
  Plus,
  Home,
  LogOut,
  FileText,
  Heart
} from 'lucide-react'
import { useAuth } from '../state/AuthContext'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { setToken } = useAuth()
  const [search, setSearch] = useState('')

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <Command className="bg-white rounded-xl shadow-2xl border overflow-hidden">
          <div className="flex items-center border-b px-3">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex-1 h-12 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
              ESC
            </kbd>
          </div>
          
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>
            
            <Command.Group heading="Navigation" className="text-xs text-gray-500 px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/dashboard'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <Home className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/customers'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <Users className="w-4 h-4" />
                <span>Go to Customers</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/campaigns'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <Target className="w-4 h-4" />
                <span>Go to Campaigns</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/segments'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <FileText className="w-4 h-4" />
                <span>Go to Segments</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/insights'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Go to Insights</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-gray-200 my-2" />
            
            <Command.Group heading="Actions" className="text-xs text-gray-500 px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/campaigns/new'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Campaign</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => navigate('/segments'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Segment</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => {
                  // Trigger health score recalculation
                  fetch('/api/customer-health/recalculate', { method: 'POST' })
                })}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <Heart className="w-4 h-4" />
                <span>Recalculate Health Scores</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-gray-200 my-2" />
            
            <Command.Group heading="Account" className="text-xs text-gray-500 px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => navigate('/profile'))}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => {
                  setToken(null)
                  navigate('/')
                })}
                className="flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100 text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
          
          <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium">
                ↵
              </kbd>
              <span>Select</span>
            </div>
          </div>
        </Command>
      </div>
    </div>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  
  return {
    open,
    setOpen,
    toggle: () => setOpen(o => !o)
  }
}
