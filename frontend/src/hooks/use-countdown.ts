import { useState, useEffect } from "react"

interface CountdownResult {
  text: string
  variant: "success" | "warning" | "destructive" | "default"
  isPast: boolean
  totalMinutes: number
}

/**
 * Live countdown hook
 * Updates every minute and returns formatted time remaining
 * 
 * @param scheduledTime - ISO string of scheduled time
 * @returns Countdown text, variant for styling, and metadata
 */
export function useCountdown(scheduledTime: string): CountdownResult {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setNow(new Date())
    }, 60000) // 60 seconds

    // Also update immediately
    setNow(new Date())

    return () => clearInterval(interval)
  }, [scheduledTime])

  const scheduled = new Date(scheduledTime)
  const diff = scheduled.getTime() - now.getTime()

  // Past due
  if (diff < 0) {
    return {
      text: "Past due",
      variant: "destructive",
      isPast: true,
      totalMinutes: 0,
    }
  }

  // Calculate time units
  const totalMinutes = Math.floor(diff / (1000 * 60))
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  const minutes = totalMinutes % 60
  const hours = totalHours % 24

  // Determine variant based on urgency
  let variant: "success" | "warning" | "destructive" | "default" = "success"
  if (totalMinutes < 15) {
    variant = "destructive" // Red - very urgent
  } else if (totalMinutes < 60) {
    variant = "warning" // Orange - urgent
  } else if (totalHours < 24) {
    variant = "warning" // Orange - today
  } else {
    variant = "success" // Green - plenty of time
  }

  // Format text
  let text = ""
  if (totalDays > 0) {
    text = `in ${totalDays} day${totalDays > 1 ? "s" : ""}`
  } else if (totalHours > 0) {
    text = `in ${totalHours}h ${minutes}m`
  } else if (totalMinutes > 0) {
    text = `in ${totalMinutes}m`
  } else {
    text = "Very soon!"
    variant = "destructive"
  }

  return {
    text,
    variant,
    isPast: false,
    totalMinutes,
  }
}