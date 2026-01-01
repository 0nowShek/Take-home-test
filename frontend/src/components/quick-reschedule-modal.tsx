"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/dialog"
import { useCountdown } from "@/hooks/use-countdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Calendar, Clock } from "lucide-react"
import type { Reminder } from "@/types/reminder"

interface QuickRescheduleModalProps {
  reminder: Reminder | null
  open: boolean
  onClose: () => void
  onReschedule: (reminderId: number, newDateTime: string) => Promise<void>
}


export function QuickRescheduleModal({
  reminder,
  open,
  onClose,
  onReschedule,
}: QuickRescheduleModalProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Pre-populate with current values when modal opens
  useEffect(() => {
    if (reminder && open) {
      const scheduledDate = new Date(reminder.scheduled_time)
      setDate(scheduledDate.toISOString().split('T')[0]) // YYYY-MM-DD
      setTime(scheduledDate.toTimeString().slice(0, 5)) // HH:MM
      setError("")
    }
  }, [reminder, open])

  if (!reminder) return null

  // Format current date/time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get relative time
  const getRelativeTime = () => {
    if (!date || !time) return null
    
    const scheduled = new Date(`${date}T${time}`)
    const now = new Date()
    const diff = scheduled.getTime() - now.getTime()
    
    if (diff < 0) return { text: "In the past", variant: "destructive" as const }
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return { text: `in ${days} day${days > 1 ? "s" : ""}`, variant: "success" as const }
    if (hours > 0) return { text: `in ${hours} hour${hours > 1 ? "s" : ""}`, variant: "warning" as const }
    if (minutes > 0) return { text: `in ${minutes} minute${minutes > 1 ? "s" : ""}`, variant: "warning" as const }
    
    return { text: "Very soon!", variant: "destructive" as const }
  }

  const relativeTime = getRelativeTime()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate future date/time
    const selectedDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    
    if (selectedDateTime <= now) {
      setError("Please select a future date and time")
      return
    }
    
    // Check if actually changed
    const originalDateTime = new Date(reminder.scheduled_time)
    if (selectedDateTime.getTime() === originalDateTime.getTime()) {
      onClose()
      return
    }
    
    setIsSubmitting(true)
    setError("")
    
    try {
      await onReschedule(reminder.id, selectedDateTime.toISOString())
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reschedule"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader onClose={onClose}>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Reschedule Reminder
            </DialogTitle>
            <DialogDescription>
              Quick reschedule without changing other details
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-6">
            {/* Reminder Info */}
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h3 className="font-semibold text-sm mb-1">{reminder.title}</h3>
              <p className="text-xs text-muted-foreground">
                Currently: {formatDateTime(reminder.scheduled_time)}
              </p>
            </div>

            {/* Date Input */}
            <FormField
              label="New Date"
              required
              htmlFor="reschedule-date"
              error={error && error.includes("date") ? error : ""}
            >
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reschedule-date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setError("")
                  }}
                  min={getMinDate()}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </FormField>

            {/* Time Input */}
            <FormField
              label="New Time"
              required
              htmlFor="reschedule-time"
              error={error && error.includes("time") ? error : ""}
            >
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reschedule-time"
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value)
                    setError("")
                  }}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </FormField>

            {/* Relative Time Preview */}
            {relativeTime && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Scheduled for</span>
                <Badge variant={relativeTime.variant}>{relativeTime.text}</Badge>
              </div>
            )}

            {/* General Error */}
            {error && !error.includes("date") && !error.includes("time") && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !date || !time}
            >
              {isSubmitting && <Spinner size="sm" />}
              {isSubmitting ? "Rescheduling..." : "Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}