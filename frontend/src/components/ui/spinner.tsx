import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Loading spinner with consistent sizing
 * 
 * Usage:
 * <Spinner /> // default
 * <Spinner size="sm" />
 * <Button disabled><Spinner size="sm" />Loading...</Button>
 */
interface SpinnerProps {
  size?: "sm" | "default" | "lg"
  className?: string
}

export function Spinner({ size = "default", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    default: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-solid border-current border-r-transparent",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}