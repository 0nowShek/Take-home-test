import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Textarea - Multi-line text input
 * 
 * Used for longer text content like reminder messages.
 * Styling matches Input component for visual consistency.
 * 
 * Features:
 * - Resizable (can be controlled via CSS)
 * - Minimum height for usability
 * - Same focus/disabled states as Input
 * - Error state support
 * 
 * Usage:
 * <Textarea placeholder="What should we say?" />
 * <Textarea rows={4} className="resize-none" />
 * <Textarea error className="border-destructive" />
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles - matches Input component
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          // Placeholder styling
          "placeholder:text-muted-foreground",
          // Focus state - critical for accessibility
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Smooth transitions for premium feel
          "transition-colors duration-200",
          // Error state for inline validation
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }