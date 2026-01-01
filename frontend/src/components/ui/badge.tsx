import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge - Status indicator component
 * 
 * Visual labels for status, categories, or metadata.
 * Maps directly to reminder statuses: scheduled, completed, failed.
 * 
 * Features:
 * - Semantic color variants for instant recognition
 * - Pill shape for modern, contained appearance
 * - Focus ring support (if made interactive)
 * 
 * Usage:
 * <Badge variant="success">Scheduled</Badge>
 * <Badge variant="destructive">Failed</Badge>
 * <Badge variant="outline">Completed</Badge>
 */
// Add these variants to the badgeVariants:
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: 
          "text-foreground border-border bg-background",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/90 shadow-sm",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm",
        // NEW: Additional variants for future features
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
        muted:
          "border-transparent bg-gray-400 text-white hover:bg-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }