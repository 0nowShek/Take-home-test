/**
 * Reminder types matching backend schema
 */

export type ReminderStatus = "scheduled" | "completed" | "failed" | "snoozed"

export interface Reminder {
  id: number
  title: string
  message: string
  phone_number: string
  scheduled_time: string  // ISO string from backend
  timezone: string
  status: ReminderStatus
  created_at: string
  updated_at: string
  call_sid?: string
  error_message?: string
}