"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { FormField } from "@/components/ui/form-field"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowLeft,
  Calendar,
  Phone,
  MessageSquare,
  Clock,
  Globe,
  CheckCircle2,
  Volume2,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { createReminder } from "@/lib/api-client"

export default function CreateReminderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  )

  // Error state
  const [errors, setErrors] = useState({
    title: "",
    message: "",
    phoneNumber: "",
    date: "",
    time: "",
  })

  // Completion tracking
  const [completed, setCompleted] = useState({
    title: false,
    message: false,
    phone: false,
    datetime: false,
  })

  // Update completion status
  useEffect(() => {
    setCompleted({
      title: title.length >= 3 && !errors.title,
      message: message.length >= 10 && !errors.message,
      phone: phoneNumber.length >= 10 && !errors.phoneNumber,
      datetime: !!date && !!time && !errors.date && !errors.time,
    })
  }, [title, message, phoneNumber, date, time, errors])

  // Get relative time display
  const getRelativeTime = () => {
    if (!date || !time) return null

    const scheduled = new Date(`${date}T${time}`)
    const now = new Date()
    const diff = scheduled.getTime() - now.getTime()

    if (diff < 0) return { text: "In the past", variant: "destructive" as const }

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return { text: `In ${days} day${days > 1 ? "s" : ""}`, variant: "success" as const }
    if (hours > 0) return { text: `In ${hours} hour${hours > 1 ? "s" : ""}`, variant: "warning" as const }
    if (minutes > 0) return { text: `In ${minutes} minute${minutes > 1 ? "s" : ""}`, variant: "warning" as const }

    return { text: "Very soon!", variant: "destructive" as const }
  }

  // Character counter color
  const getMessageCounterColor = () => {
    const length = message.length
    if (length === 0) return "text-muted-foreground"
    if (length < 10) return "text-destructive"
    if (length < 50) return "text-warning"
    if (length > 450) return "text-warning"
    return "text-success"
  }

  // Validation functions
  const validateTitle = (value: string) => {
    if (!value.trim()) return "Give your reminder a name"
    if (value.length < 3) return "At least 3 characters please"
    if (value.length > 100) return "Keep it under 100 characters"
    return ""
  }

  const validateMessage = (value: string) => {
    if (!value.trim()) return "What should we say when we call?"
    if (value.length < 10) return "Message is too short (min 10 characters)"
    if (value.length > 500) return "Message is too long (max 500 characters)"
    return ""
  }

  const validatePhoneNumber = (value: string) => {
    if (!value.trim()) {
      return "Phone number is required"
    }
    
    // Extract just digits
    const digits = value.replace(/\D/g, "")
    
    // Check length
    if (digits.length < 10) {
      return `Too short - need at least 10 digits (have ${digits.length})`
    }
    
    if (digits.length > 11) {
      return `Too long - max 11 digits (have ${digits.length})`
    }
    
    // If 11 digits, first must be 1
    if (digits.length === 11 && !digits.startsWith("1")) {
      return "11-digit numbers must start with 1"
    }
    
    // Area code check (first digit after country code)
    const areaCodeStart = digits.length === 11 ? digits[1] : digits[0]
    if (areaCodeStart === "0" || areaCodeStart === "1") {
      return "Invalid area code (can't start with 0 or 1)"
    }
    
    return ""
  }

  const validateDateTime = (dateValue: string, timeValue: string) => {
    if (!dateValue) return { date: "Choose a date", time: "" }
    if (!timeValue) return { date: "", time: "Choose a time" }

    const selectedDateTime = new Date(`${dateValue}T${timeValue}`)
    const now = new Date()

    if (selectedDateTime <= now) {
      return { date: "Pick a future date & time", time: "" }
    }

    return { date: "", time: "" }
  }

  // Format phone for API submission
  const formatPhoneForAPI = (phone: string) => {
    const digits = phone.replace(/\D/g, "")
    
    if (digits.length === 10) {
      return `+1${digits}`
    }
    
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`
    }
    
    return `+${digits}`
  }

  // Change handlers
  const handleTitleChange = (value: string) => {
    setTitle(value)
    setErrors((prev) => ({ ...prev, title: validateTitle(value) }))
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    setErrors((prev) => ({ ...prev, message: validateMessage(value) }))
  }

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value)
    setErrors((prev) => ({ ...prev, phoneNumber: validatePhoneNumber(value) }))
  }

  const handleDateChange = (value: string) => {
    setDate(value)
    const dateTimeErrors = validateDateTime(value, time)
    setErrors((prev) => ({ ...prev, date: dateTimeErrors.date, time: dateTimeErrors.time }))
  }

  const handleTimeChange = (value: string) => {
    setTime(value)
    const dateTimeErrors = validateDateTime(date, value)
    setErrors((prev) => ({ ...prev, date: dateTimeErrors.date, time: dateTimeErrors.time }))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const titleError = validateTitle(title)
    const messageError = validateMessage(message)
    const phoneError = validatePhoneNumber(phoneNumber)
    const dateTimeErrors = validateDateTime(date, time)

    setErrors({
      title: titleError,
      message: messageError,
      phoneNumber: phoneError,
      date: dateTimeErrors.date,
      time: dateTimeErrors.time,
    })

    if (titleError || messageError || phoneError || dateTimeErrors.date || dateTimeErrors.time) {
      toast({
        title: "Almost there!",
        description: "Please check the highlighted fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create datetime string (no timezone conversion)
      const scheduledTime = `${date}T${time}:00`

      // Call API
      await createReminder({
        title: title.trim(),
        message: message.trim(),
        phone_number: formatPhoneForAPI(phoneNumber),
        scheduled_time: scheduledTime,
        timezone,
      })

      // Success!
      toast({
        title: "Reminder created ✓",
        description: `We'll call you ${getRelativeTime()?.text.toLowerCase() || "soon"}`,
        variant: "success",
      })

      // Redirect to dashboard
      router.push("/")
    } catch (error: any) {
      console.error("Error creating reminder:", error)
      
      const errorMessage = error?.response?.data?.detail || error.message || "Failed to create reminder"
      
      toast({
        title: "Oops!",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const relativeTime = getRelativeTime()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Create Reminder</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  We'll call you at the perfect time ✨
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* Progress indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full transition-colors ${completed.title ? "bg-success" : "bg-muted"}`} />
                <div className={`h-2 w-2 rounded-full transition-colors ${completed.message ? "bg-success" : "bg-muted"}`} />
                <div className={`h-2 w-2 rounded-full transition-colors ${completed.phone ? "bg-success" : "bg-muted"}`} />
                <div className={`h-2 w-2 rounded-full transition-colors ${completed.datetime ? "bg-success" : "bg-muted"}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto grid gap-6 lg:grid-cols-3">
          {/* Main Form - 2 columns */}
          <Card className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Reminder Details
                </CardTitle>
                <CardDescription>
                  Fill out the form. We'll handle the rest.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Title */}
                <FormField
                  label="What's this reminder about?"
                  required
                  htmlFor="title"
                  error={errors.title}
                >
                  <div className="relative">
                    {completed.title && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                    )}
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      onBlur={() => setErrors((prev) => ({ ...prev, title: validateTitle(title) }))}
                      placeholder="Team meeting, Doctor appointment, Pick up kids..."
                      error={!!errors.title}
                      maxLength={100}
                      className={completed.title ? "pr-10" : ""}
                    />
                  </div>
                </FormField>

                {/* Message */}
                <FormField
                  label="What should we say when we call?"
                  required
                  htmlFor="message"
                  error={errors.message}
                >
                  <div className="relative">
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      onBlur={() => setErrors((prev) => ({ ...prev, message: validateMessage(message) }))}
                      placeholder="Hey! This is your reminder about the quarterly review meeting at 3 PM. Don't forget to bring your laptop and the Q3 report. See you in the main conference room!"
                      className="min-h-[140px] resize-none"
                      error={!!errors.message}
                      maxLength={500}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      {completed.message && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                      <span className={`text-xs font-medium ${getMessageCounterColor()}`}>
                        {message.length}/500
                      </span>
                    </div>
                  </div>
                  {message.length >= 10 && (
                    <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                      <Volume2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>Estimated call duration: ~{Math.ceil(message.length / 15)} seconds</span>
                    </div>
                  )}
                </FormField>

                {/* Phone Number */}
                <FormField
                  label="Phone number to call"
                  required
                  htmlFor="phone"
                  error={errors.phoneNumber}
                  helperText="🇺🇸 US numbers: 10 digits or +1 followed by 10 digits"
                >
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                    {completed.phone && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                    )}
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneNumberChange(e.target.value)}
                      placeholder="4155552671 or +1 415 555 2671"
                      className={`pl-10 ${completed.phone ? "pr-10" : ""}`}
                      error={!!errors.phoneNumber}
                    />
                  </div>
                </FormField>

                {/* Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Date"
                    required
                    htmlFor="date"
                    error={errors.date}
                  >
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={getMinDate()}
                        error={!!errors.date}
                        className="pl-10"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Time"
                    required
                    htmlFor="time"
                    error={errors.time}
                  >
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        error={!!errors.time}
                        className="pl-10"
                      />
                    </div>
                  </FormField>
                </div>

                {/* Relative time display */}
                {relativeTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Scheduled for</span>
                    <Badge variant={relativeTime.variant}>{relativeTime.text}</Badge>
                  </div>
                )}

                {/* Timezone */}
                <FormField
                  label="Timezone"
                  required
                  htmlFor="timezone"
                  helperText="Auto-detected from your location"
                >
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
                      <option value="America/Phoenix">Arizona (MST)</option>
                      <option value="America/Anchorage">Alaska (AKT)</option>
                      <option value="Pacific/Honolulu">Hawaii (HT)</option>
                    </Select>
                  </div>
                </FormField>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1"
                >
                  {isSubmitting && <Spinner size="sm" className="mr-2" />}
                  {isSubmitting ? "Creating reminder..." : "Create Reminder"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Preview Sidebar - 1 column */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Call Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!message ? (
                  <p className="text-sm text-muted-foreground">
                    Start typing your message to see a preview...
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-sm italic">"{message}"</p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>Calling: {phoneNumber || "..."}</span>
                      </div>
                      {relativeTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{relativeTime.text}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Keep messages clear and concise</p>
                <p>• Include important details like time and location</p>
                <p>• Double-check your phone number</p>
                <p>• Set reminders at least 5 minutes ahead</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}