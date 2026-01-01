"use client"

import { useState, useEffect } from "react"
import { CountdownBadge } from "@/components/countdown-badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { ReminderListSkeleton } from "@/components/skeleton/reminder-card-skeleton"
import { NoReminders } from "@/components/empty-states/no-reminders"
import { NoSearchResults } from "@/components/empty-states/no-search-results"
import { Calendar, Clock, Edit, Plus, Search, Trash2, Phone, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Reminder, ReminderStatus } from "@/types/reminder"
import { cn } from "@/lib/utils"
import { getReminders, deleteReminder } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { QuickRescheduleModal } from "@/components/quick-reschedule-modal"
import { updateReminder } from "@/lib/api-client"
import { ThemeToggle } from "@/components/theme-toggle"
import { RetryModal } from "@/components/retry-modal"

/**
 * Dashboard Page - Connected to Backend API
 * 
 * Features:
 * - Fetches real data from FastAPI backend
 * - CRUD operations with real API calls
 * - Premium filter pills with count badges
 * - Search and sort
 * - Loading and error states
 */
export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | "all">("all")
  const [sortBy, setSortBy] = useState<"scheduled_time" | "created_at" | "title">("scheduled_time")
  const [deletingIds, setDeletingIds] = useState<number[]>([])
  const [reschedulingReminder, setReschedulingReminder] = useState<Reminder | null>(null)
  const [retryingReminder, setRetryingReminder] = useState<Reminder | null>(null)

  // Fetch reminders on mount
  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getReminders()
      setReminders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch reminders"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get counts for each status
  const statusCounts = {
    all: reminders.length,
    scheduled: reminders.filter(r => r.status === "scheduled").length,
    completed: reminders.filter(r => r.status === "completed").length,
    failed: reminders.filter(r => r.status === "failed").length,
  }

  // Get urgent reminders (< 1 hour away)
  const urgentReminders = reminders.filter(r => {
    if (r.status !== "scheduled") return false
    const diff = new Date(r.scheduled_time).getTime() - new Date().getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    return minutes > 0 && minutes < 60
  })
  // Filter and search logic
  const filteredReminders = reminders.filter((reminder) => {
    // Status filter
    if (statusFilter !== "all" && reminder.status !== statusFilter) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        reminder.title.toLowerCase().includes(query) ||
        reminder.message.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Sort reminders
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    switch (sortBy) {
      case "scheduled_time":
        return new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
      case "created_at":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  // Helper: Get time remaining
  const getTimeRemaining = (scheduledTime: string) => {
    const now = new Date()
    const scheduled = new Date(scheduledTime)
    const diff = scheduled.getTime() - now.getTime()

    if (diff < 0) return "Past due"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `in ${days} day${days > 1 ? "s" : ""}`
    }

    if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    }

    return `in ${minutes}m`
  }

  // Helper: Format phone number
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  // Helper: Get badge variant
  const getStatusBadge = (status: ReminderStatus) => {
    const baseClasses = "transition-all duration-200 hover:scale-110"

    switch (status) {
      case "scheduled":
        return <Badge variant="success" className={baseClasses}>Scheduled</Badge>
      case "completed":
        return <Badge variant="outline" className={baseClasses}>Completed</Badge>
      case "failed":
        return <Badge variant="destructive" className={baseClasses}>Failed</Badge>
      default:
        return <Badge className={baseClasses}>{status}</Badge>
    }
  }

  // Actions
  const handleDelete = async (id: number, title: string) => {
    // Find the reminder to delete (keep a copy for undo)
    const reminderToDelete = reminders.find(r => r.id === id)
    if (!reminderToDelete) return

    // Start exit animation
    setDeletingIds(prev => [...prev, id])

    try {
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 300))

      // Remove from local state (optimistic update)
      setReminders(prev => prev.filter(r => r.id !== id))
      setDeletingIds(prev => prev.filter(i => i !== id))

      // Track if undo was clicked
      let undoClicked = false

      // Show toast with undo button
      toast({
        title: "Reminder deleted",
        description: `"${title}" has been removed.`,
        variant: "destructive",
        duration: 5000, // 5 seconds to undo
        onUndo: () => {
          undoClicked = true

          // Restore to local state immediately
          setReminders(prev => {
            // Insert back in original position (sorted by scheduled_time)
            const newList = [...prev, reminderToDelete]
            return newList.sort((a, b) =>
              new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
            )
          })

          // Show restored toast
          toast({
            title: "Reminder restored! ↩️",
            description: `"${title}" is back.`,
            variant: "success",
          })
        },
      })

      // Wait for toast duration, then permanently delete from backend
      setTimeout(async () => {
        if (!undoClicked) {
          try {
            await deleteReminder(id)
            console.log(`✅ Permanently deleted reminder ${id} from backend`)
          } catch (err) {
            // If backend delete fails, restore the reminder
            const errorMessage = err instanceof Error ? err.message : "Failed to delete reminder"

            setReminders(prev => {
              const newList = [...prev, reminderToDelete]
              return newList.sort((a, b) =>
                new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
              )
            })

            toast({
              title: "Delete failed",
              description: errorMessage,
              variant: "destructive",
            })
          }
        }
      }, 5000) // Match toast duration

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete reminder"
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive",
      })

      // Remove from deleting state on error
      setDeletingIds(prev => prev.filter(i => i !== id))
    }
  }
  const handleEdit = (id: number) => {
    router.push(`/edit/${id}`)
  }

  const handleCreateNew = () => {
    router.push("/create")
  }
  const handleRetry = async (minutes: number) => {
    if (!retryingReminder) return

    try {
      setIsLoading(true)

      // Calculate new scheduled time
      const newTime = new Date()
      newTime.setMinutes(newTime.getMinutes() + minutes)

      // Update reminder to scheduled status with new time
      await updateReminder(retryingReminder.id, {
        status: "scheduled",
        scheduled_time: newTime.toISOString(),
      })

      // Show success message
      const timeStr = newTime.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      })

      toast({
        title: "Retry scheduled ✓",
        description: `Will try again at ${timeStr}`,
        variant: "success",
      })

      // Refresh reminders
      fetchReminders()
      setRetryingReminder(null)

    } catch (error) {
      console.error("Error retrying reminder:", error)
      toast({
        title: "Retry failed",
        description: "Could not reschedule reminder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleReschedule = async (reminderId: number, newDateTime: string) => {
    try {
      // Update via API
      await updateReminder(reminderId, {
        scheduled_time: newDateTime,
      })

      // Update local state
      setReminders(prev =>
        prev.map(r =>
          r.id === reminderId
            ? { ...r, scheduled_time: newDateTime, updated_at: new Date().toISOString() }
            : r
        )
      )

      // Show success toast
      toast({
        title: "Rescheduled! ⏰",
        description: "Reminder time has been updated",
        variant: "success",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reschedule"
      toast({
        title: "Reschedule failed",
        description: errorMessage,
        variant: "destructive",
      })
      throw error // Re-throw so modal can handle it
    }
  }
  // Add this helper function at the top of the component
// Simple helper - no timezone conversion needed
const formatDateTime = (dateTimeString: string) => {
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch (error) {
    return 'Invalid date'
  }
}

const formatTime = (dateTimeString: string) => {
  try {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch (error) {
    return 'Invalid time'
  }
}
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Reminders</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {statusCounts.all} total • {statusCounts.scheduled} scheduled • {statusCounts.completed} completed
                {urgentReminders.length > 0 && (
                  <span className="ml-2 text-destructive font-semibold animate-pulse">
                    • {urgentReminders.length} urgent
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="lg" onClick={fetchReminders} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button onClick={handleCreateNew} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                New Reminder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reminders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Pills + Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "gap-2 transition-all duration-200",
                    "hover:scale-105",
                    statusFilter !== "all" && "hover:bg-muted"
                  )}
                >
                  All
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.all}
                  </Badge>
                </Button>

                <Button
                  variant={statusFilter === "scheduled" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter("scheduled")}
                  className="gap-2"
                >
                  <Clock className="h-3 w-3" />
                  Scheduled
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.scheduled}
                  </Badge>
                </Button>

                <Button
                  variant={statusFilter === "completed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter("completed")}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.completed}
                  </Badge>
                </Button>

                <Button
                  variant={statusFilter === "failed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter("failed")}
                  className="gap-2"
                >
                  <XCircle className="h-3 w-3" />
                  Failed
                  <Badge variant="secondary" className="ml-1">
                    {statusCounts.failed}
                  </Badge>
                </Button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort:</span>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-auto min-w-[140px]"
                >
                  <option value="scheduled_time">Due date</option>
                  <option value="created_at">Created date</option>
                  <option value="title">Title</option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && <ReminderListSkeleton count={6} />}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Reminders
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={fetchReminders} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Empty State - No Reminders */}
        {!isLoading && !error && reminders.length === 0 && (
          <NoReminders onCreateClick={handleCreateNew} />
        )}

        {/* Empty State - No Search Results */}
        {!isLoading && !error && reminders.length > 0 && sortedReminders.length === 0 && (
          <NoSearchResults
            searchTerm={searchQuery}
            onClearFilters={() => {
              setSearchQuery("")
              setStatusFilter("all")
            }}
          />
        )}

        {/* Reminders Grid */}
        {!isLoading && !error && sortedReminders.length > 0 && (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sortedReminders.map((reminder, index) => (
              <Card
                key={`${reminder.id}-${statusFilter}`}
                className={cn(
                  "flex flex-col animate-in fade-in slide-in-from-bottom-4",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-xl",
                  "hover:border-primary/50",
                  "active:scale-[0.98]",
                  deletingIds.includes(reminder.id) && "animate-out scale-out"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {reminder.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="h-3 w-3" />
                          <time>{formatDateTime(reminder.scheduled_time)}</time>
                      </CardDescription>
                    </div>
                    {getStatusBadge(reminder.status)}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {reminder.message}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{formatPhoneNumber(reminder.phone_number)}</span>
                  </div>

                  {reminder.status === "scheduled" && (
                    <CountdownBadge scheduledTime={reminder.scheduled_time} />
                  )}

                  {/* Balanced Success Box */}
                  {/* Success Message */}
                  {reminder.status === "completed" && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                          Call Completed Successfully
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Balanced Failed Box */}
                  {reminder.status === "failed" && reminder.error_message && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                          Call Failed
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="justify-end gap-2">
                  
                  {/* Reschedule - Only for scheduled */}
                  {(reminder.status === "scheduled" || reminder.status === "failed") &&(
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReschedulingReminder(reminder)}
                      className="hover:bg-primary/10 transition-all hover:scale-105"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Reschedule
                    </Button>
                  )}

                  {/* Edit - Only for scheduled */}
                  {reminder.status === "scheduled" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(reminder.id)}
                      className="hover:bg-muted transition-all hover:scale-105"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}

                  {/* Delete - Always available */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(reminder.id, reminder.title)}
                    className="transition-all hover:scale-105"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Reschedule Modal */}
      <QuickRescheduleModal
        reminder={reschedulingReminder}
        open={!!reschedulingReminder}
        onClose={() => setReschedulingReminder(null)}
        onReschedule={handleReschedule}
      />
      {/* Retry Modal */}
      <RetryModal
        isOpen={!!retryingReminder}
        onClose={() => setRetryingReminder(null)}
        onRetry={handleRetry}
        reminderTitle={retryingReminder?.title || ""}
      />
    </div>
  )
}