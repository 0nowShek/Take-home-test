import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Select - Dropdown selection component
 * 
 * Native HTML select styled to match design system.
 * Used for timezone selection and status filters.
 * 
 * Features:
 * - Native select for best mobile UX
 * - Custom arrow icon (removes browser default)
 * - Consistent styling with Input/Textarea
 * - Keyboard navigable
 * 
 * Usage:
 * <Select>
 *   <option value="utc">UTC</option>
 *   <option value="est">Eastern Time</option>
 * </Select>
 * 
 * Note: For complex select needs (search, multi-select), 
 * consider upgrading to Radix UI Select component.
 */
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <select
        className={cn(
          // Base styles - matches Input component
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          // Focus state
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Smooth transitions
          "transition-colors duration-200",
          // Custom dropdown arrow
          "appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3cpath%20fill%3D%22%23666%22%20d%3D%22M10.293%203.293L6%207.586%201.707%203.293A1%201%200%2000.293%204.707l5%205a1%201%200%20001.414%200l5-5a1%201%200%2010-1.414-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10",
          // Error state
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }