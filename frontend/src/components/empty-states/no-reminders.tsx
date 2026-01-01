import { Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Empty state for when no reminders exist
 * 
 * Features:
 * - Large icon for visual interest
 * - Clear heading and description
 * - Primary CTA button
 * - Works in dark/light mode
 */
interface NoRemindersProps {
  onCreateClick?: () => void
}

export function NoReminders({ onCreateClick }: NoRemindersProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Calendar className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-2xl font-semibold mb-2">No reminders yet</h3>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        Get started by creating your first reminder. We'll call you at the perfect time.
      </p>
      
      <Button onClick={onCreateClick} size="lg">
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Reminder
      </Button>
    </div>
  )
}