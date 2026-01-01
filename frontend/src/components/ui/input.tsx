import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Input component with consistent styling and accessibility
 * 
 * Features:
 * - Focus ring for keyboard navigation
 * - Disabled state styling
 * - Error state support via className
 * - Forward ref for form library integration (react-hook-form)
 * 
 * Usage:
 * <Input placeholder="Enter text..." />
 * <Input type="email" className="border-destructive" /> // Error state
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean // Explicit error prop for validation
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          // File input handling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Placeholder
          "placeholder:text-muted-foreground",
          // Focus state - critical for accessibility
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Transitions for premium feel
          "transition-colors duration-200",
          // Error state
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }