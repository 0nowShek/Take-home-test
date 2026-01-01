/**
 * API Client for Call Me Reminder Backend
 * 
 * Centralized API calls with error handling and TypeScript types.
 * Base URL points to FastAPI backend running on port 8000.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  // Handle 204 No Content (DELETE success)
  if (response.status === 204) {
    return null as T
  }

  const data = await response.json()

  if (!response.ok) {
    // Extract error message from FastAPI response
    const errorMessage = data.detail || `API error: ${response.status}`
    throw new Error(errorMessage)
  }

  return data
}

/**
 * Reminder API types
 */
export interface CreateReminderData {
  title: string
  message: string
  phone_number: string
  scheduled_time: string  // ISO string
  timezone: string
}

export interface UpdateReminderData {
  title?: string
  message?: string
  phone_number?: string
  scheduled_time?: string
  timezone?: string
  status?: string
}

export interface ReminderResponse {
  id: number
  title: string
  message: string
  phone_number: string
  scheduled_time: string
  timezone: string
  status: "scheduled" | "completed" | "failed" | "snoozed"
  created_at: string
  updated_at: string
  call_sid?: string
  error_message?: string
}

/**
 * API Methods
 */

// GET /api/reminders - Get all reminders
export async function getReminders(
  params?: { skip?: number; limit?: number; status?: string }
): Promise<ReminderResponse[]> {
  const searchParams = new URLSearchParams()
  if (params?.skip) searchParams.append("skip", params.skip.toString())
  if (params?.limit) searchParams.append("limit", params.limit.toString())
  if (params?.status) searchParams.append("status", params.status)

  const query = searchParams.toString()
  const endpoint = query ? `/api/reminders?${query}` : "/api/reminders"

  return apiFetch<ReminderResponse[]>(endpoint)
}

// GET /api/reminders/:id - Get single reminder
export async function getReminder(id: number): Promise<ReminderResponse> {
  return apiFetch<ReminderResponse>(`/api/reminders/${id}`)
}

// POST /api/reminders - Create reminder
export async function createReminder(
  data: CreateReminderData
): Promise<ReminderResponse> {
  return apiFetch<ReminderResponse>("/api/reminders", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// PUT /api/reminders/:id - Update reminder
export async function updateReminder(
  id: number,
  data: UpdateReminderData
): Promise<ReminderResponse> {
  return apiFetch<ReminderResponse>(`/api/reminders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// DELETE /api/reminders/:id - Delete reminder
export async function deleteReminder(id: number): Promise<void> {
  return apiFetch<void>(`/api/reminders/${id}`, {
    method: "DELETE",
  })
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health")
}