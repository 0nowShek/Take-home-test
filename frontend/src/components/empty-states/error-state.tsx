import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Empty state for errors
 * Shows when data fetching fails
 */
interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ 
  title = "Something went wrong",
  message = "We couldn't load your reminders. Please try again.",
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        {message}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  )
}