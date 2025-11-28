import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../state/AuthContext'
import { apiFetch } from '../api'
import Card, { CardBody, CardHeader } from './ui/Card'
import Button from './ui/Button'
import { 
  Mail, 
  Phone, 
  FileText, 
  ShoppingCart, 
  Megaphone,
  Heart,
  MessageSquare,
  CalendarCheck,
  AlertCircle,
  Clock,
  Plus,
  Filter,
  RefreshCw
} from 'lucide-react'
import { cn, formatRelativeTime, formatDateTime } from '../lib/utils'

interface Activity {
  _id: string
  customerId: string
  type: string
  title: string
  description?: string
  metadata?: Record<string, any>
  performedBy?: {
    _id: string
    name: string
  }
  createdAt: string
}

interface ActivityTimelineProps {
  customerId?: string
  limit?: number
  showFilters?: boolean
}

const activityIcons: Record<string, React.ReactNode> = {
  email_sent: <Mail className="w-4 h-4" />,
  email_opened: <Mail className="w-4 h-4" />,
  email_clicked: <Mail className="w-4 h-4" />,
  call_made: <Phone className="w-4 h-4" />,
  note_added: <FileText className="w-4 h-4" />,
  order_placed: <ShoppingCart className="w-4 h-4" />,
  campaign_received: <Megaphone className="w-4 h-4" />,
  health_score_changed: <Heart className="w-4 h-4" />,
  segment_joined: <Filter className="w-4 h-4" />,
  segment_left: <Filter className="w-4 h-4" />,
  meeting_scheduled: <CalendarCheck className="w-4 h-4" />,
  support_ticket: <MessageSquare className="w-4 h-4" />,
  custom: <AlertCircle className="w-4 h-4" />,
}

const activityColors: Record<string, string> = {
  email_sent: 'bg-blue-100 text-blue-600',
  email_opened: 'bg-green-100 text-green-600',
  email_clicked: 'bg-brand-100 text-brand-600',
  call_made: 'bg-amber-100 text-amber-600',
  note_added: 'bg-gray-100 text-gray-600',
  order_placed: 'bg-emerald-100 text-emerald-600',
  campaign_received: 'bg-pink-100 text-pink-600',
  health_score_changed: 'bg-red-100 text-red-600',
  segment_joined: 'bg-indigo-100 text-indigo-600',
  segment_left: 'bg-orange-100 text-orange-600',
  meeting_scheduled: 'bg-cyan-100 text-cyan-600',
  support_ticket: 'bg-yellow-100 text-yellow-600',
  custom: 'bg-slate-100 text-slate-600',
}

const activityTypes = [
  { value: 'all', label: 'All Activities' },
  { value: 'email_sent', label: 'Emails Sent' },
  { value: 'call_made', label: 'Calls' },
  { value: 'note_added', label: 'Notes' },
  { value: 'order_placed', label: 'Orders' },
  { value: 'campaign_received', label: 'Campaigns' },
  { value: 'health_score_changed', label: 'Health Changes' },
]

export default function ActivityTimeline({ 
  customerId, 
  limit = 20,
  showFilters = true 
}: ActivityTimelineProps) {
  const { token } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAddNote, setShowAddNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [token, customerId, filter])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const endpoint = customerId 
        ? `/api/activities/customer/${customerId}`
        : '/api/activities/recent'
      
      const params = new URLSearchParams()
      params.set('limit', limit.toString())
      if (filter !== 'all') {
        params.set('type', filter)
      }
      
      const res = await apiFetch<{ activities: Activity[] }>(
        `${endpoint}?${params}`, 
        {}, 
        token
      )
      setActivities(res.activities)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (!customerId || !noteText.trim()) return
    
    try {
      setSaving(true)
      await apiFetch(`/api/activities/customer/${customerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'note_added',
          title: 'Note Added',
          description: noteText.trim()
        })
      }, token)
      
      setNoteText('')
      setShowAddNote(false)
      await fetchActivities()
    } catch (err) {
      console.error('Failed to add note:', err)
    } finally {
      setSaving(false)
    }
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      {showFilters && (
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {activityTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      )}
      {customerId && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddNote(!showAddNote)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Note
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchActivities}
        disabled={loading}
      >
        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader title="Activity Timeline" actions={headerActions} />
      
      <CardBody className="p-0">
        {/* Add Note Form */}
        <AnimatePresence>
          {showAddNote && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b overflow-hidden"
            >
              <div className="p-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this customer..."
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddNote(false)
                      setNoteText('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={addNote}
                    disabled={!noteText.trim() || saving}
                  >
                    {saving ? 'Saving...' : 'Save Note'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-gray-500 mt-2">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No activities found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200" />
            
            <div className="divide-y">
              {activities.map((activity, idx) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="relative pl-16 pr-4 py-4 hover:bg-gray-50"
                >
                  {/* Icon */}
                  <div className={cn(
                    "absolute left-4 w-8 h-8 rounded-full flex items-center justify-center",
                    activityColors[activity.type] || activityColors.custom
                  )}>
                    {activityIcons[activity.type] || activityIcons.custom}
                  </div>
                  
                  {/* Content */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {activity.description}
                        </p>
                      )}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
                            <span 
                              key={key}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                      {activity.performedBy && (
                        <p className="text-xs text-gray-400 mt-1">
                          by {activity.performedBy.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-gray-500" title={formatDateTime(activity.createdAt)}>
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
