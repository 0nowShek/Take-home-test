"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Phone, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { getReminder, updateReminder } from "@/lib/api-client"
import type { ReminderResponse } from "@/lib/api-client"

export default function EditReminderPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const reminderId = parseInt(params.id as string)

  // Form state
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [timezone, setTimezone] = useState("America/New_York")

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [originalReminder, setOriginalReminder] = useState<ReminderResponse | null>(null)

  // Load reminder on mount
  useEffect(() => {
    loadReminder()
  }, [reminderId])

const loadReminder = async () => {
  try {
    setIsLoading(true)
    const reminder = await getReminder(reminderId)
    
    if (!reminder) {
      toast({
        title: "Reminder not found",
        description: "This reminder may have been deleted.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Check if reminder can be edited
    if (reminder.status === "completed") {
      toast({
        title: "Cannot edit completed reminder",
        description: "This reminder has already been completed. Create a new one instead.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    if (reminder.status === "failed") {
      toast({
        title: "Cannot edit failed reminder",
        description: "This reminder has failed. Please create a new one instead.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Store reminder
    setOriginalReminder(reminder)
    setTitle(reminder.title)
    setMessage(reminder.message)
    setPhoneNumber(formatPhoneForDisplay(reminder.phone_number))
    setTimezone(reminder.timezone || "America/New_York")

    // Parse scheduled_time correctly
    // The scheduled_time from API is a string like "2026-01-01T22:20:00"
    // We need to parse it as-is, not convert timezones
    const scheduledDateTime = reminder.scheduled_time
    
    // Extract date and time parts directly from the string
    // Format: "2026-01-01T22:20:00" or "2026-01-01T22:20:00.000000"
    const [datePart, timePart] = scheduledDateTime.split('T')
    
    setDate(datePart) // YYYY-MM-DD format (perfect for input[type="date"])
    setTime(timePart.substring(0, 5)) // HH:MM format (perfect for input[type="time"])

  } catch (error) {
    console.error("Error loading reminder:", error)
    toast({
      title: "Failed to load reminder",
      description: "Please try again.",
      variant: "destructive",
    })
    router.push("/")
  } finally {
    setIsLoading(false)
  }
}
  // Format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    // +14155552671 → +1 415 555 2671
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    }
    return phone
  }

  // Format phone number for API (remove spaces)
  const formatPhoneForAPI = (phone: string) => {
    return phone.replace(/\s/g, "")
  }

  // Validation functions
  const validateTitle = (value: string) => {
    if (!value.trim()) return "Title is required"
    if (value.trim().length < 3) return "Title must be at least 3 characters"
    return ""
  }

  const validateMessage = (value: string) => {
    if (!value.trim()) return "Message is required"
    if (value.trim().length < 10) return "Message must be at least 10 characters"
    if (value.trim().length > 500) return "Message is too long (max 500 characters)"
    return ""
  }

  const validatePhoneNumber = (value: string) => {
    if (!value.trim()) return "Phone number is required"
    const cleaned = value.replace(/\s/g, "").replace(/-/g, "")
    if (!cleaned.startsWith("+1")) return "Must be a US number (+1 XXX XXX XXXX)"
    if (cleaned.length !== 12) return "Must be 10 digits after +1"
    const digits = cleaned.slice(2)
    if (!/^\d{10}$/.test(digits)) return "Must contain only digits"
    if (digits[0] === "0" || digits[0] === "1") return "Invalid area code"
    return ""
  }

  const validateDateTime = () => {
    if (!date) return "Date is required"
    if (!time) return "Time is required"

    const scheduledDateTime = new Date(`${date}T${time}`)
    const now = new Date()

    if (scheduledDateTime <= now) {
      return "Scheduled time must be in the future"
    }

    return ""
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: Record<string, string> = {}
    newErrors.title = validateTitle(title)
    newErrors.message = validateMessage(message)
    newErrors.phoneNumber = validatePhoneNumber(phoneNumber)
    newErrors.dateTime = validateDateTime()

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key]
    })

    setErrors(newErrors)

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation failed",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Combine date and time
      const scheduledTime = new Date(`${date}T${time}`)

      // Update reminder
      await updateReminder(reminderId, {
        title: title.trim(),
        message: message.trim(),
        phone_number: formatPhoneForAPI(phoneNumber),
        scheduled_time: scheduledTime.toISOString(),
        timezone,
      })

      toast({
        title: "Reminder updated ✓",
        description: "Your changes have been saved.",
        variant: "success",
      })

      // Redirect to dashboard
      router.push("/")

    } catch (error: any) {
      console.error("Error updating reminder:", error)

      // Parse validation errors from backend
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          detail.forEach((err: any) => {
            const field = err.loc[err.loc.length - 1]
            newErrors[field] = err.msg
          })
          setErrors(newErrors)
        } else if (typeof detail === "string") {
          toast({
            title: "Update failed",
            description: detail,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Update failed",
          description: "Could not save changes. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/")
  }

  // Auto-format phone number as user types
  const handlePhoneNumberChange = (value: string) => {
    let formatted = value

    // Auto-add +1 if needed
    if (value.length > 0 && !value.startsWith("+")) {
      formatted = "+1 " + value
    }
    if (value === "+") {
      formatted = "+1 "
    }

    // Format: +1 XXX XXX XXXX
    const cleaned = formatted.replace(/[^\d+]/g, "")
    if (cleaned.startsWith("+1")) {
      const digits = cleaned.slice(2)
      if (digits.length === 0) {
        formatted = "+1 "
      } else if (digits.length <= 3) {
        formatted = `+1 ${digits}`
      } else if (digits.length <= 6) {
        formatted = `+1 ${digits.slice(0, 3)} ${digits.slice(3)}`
      } else {
        formatted = `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
      }
    }

    setPhoneNumber(formatted)
    setErrors((prev) => ({ ...prev, phoneNumber: validatePhoneNumber(formatted) }))
  }

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading reminder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Edit Reminder</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Update your reminder details
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reminder Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                Reminder Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  What's this reminder about? <span className="text-destructive">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    setErrors((prev) => ({ ...prev, title: validateTitle(e.target.value) }))
                  }}
                  placeholder="Team meeting, Doctor appointment, Pick up kids..."
                  maxLength={100}
                  error={!!errors.title}
                />
                {errors.title && (
                  <p className="text-xs text-destructive mt-1">{errors.title}</p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  What should we say when we call? <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    setErrors((prev) => ({ ...prev, message: validateMessage(e.target.value) }))
                  }}
                  placeholder="Hey! This is your reminder about the quarterly review meeting at 3 PM. Don't forget to bring your laptop and the Q3 report. See you in the main conference room!"
                  rows={4}
                  maxLength={500}
                  error={!!errors.message}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.message ? (
                    <p className="text-xs text-destructive">{errors.message}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      This will be read aloud during the call
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{message.length}/500</p>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone number to call <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="+1 415 555 2671"
                    className="pl-10"
                    error={!!errors.phoneNumber}
                    maxLength={17}
                  />
                </div>
                {errors.phoneNumber ? (
                  <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    🇺🇸 US numbers only • Country code (+1) auto-added
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium mb-2">
                    Date <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value)
                        setErrors((prev) => ({ ...prev, dateTime: validateDateTime() }))
                      }}
                      min={getMinDate()}
                      className="pl-10"
                      error={!!errors.dateTime}
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="time" className="block text-sm font-medium mb-2">
                    Time <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value)
                        setErrors((prev) => ({ ...prev, dateTime: validateDateTime() }))
                      }}
                      className="pl-10"
                      error={!!errors.dateTime}
                    />
                  </div>
                </div>
              </div>

              {errors.dateTime && (
                <p className="text-xs text-destructive">{errors.dateTime}</p>
              )}

              {/* Timezone */}
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                  Timezone
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                  <Select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="pl-10"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Phoenix">Arizona Time (MST)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-detected from your location
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}