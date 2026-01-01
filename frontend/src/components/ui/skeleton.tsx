import { cn } from "@/lib/utils"

/**
 * Skeleton loader with colored shimmer animation
 * 
 * Uses primary color for high visibility shimmer effect.
 * Much more pronounced than subtle white shimmer.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        // Colored shimmer with primary color
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-shimmer",
        "before:bg-gradient-to-r",
        "before:from-transparent",
        "before:via-primary/20",        // Primary color shimmer (light mode)
        "before:to-transparent",
        "dark:before:via-primary/15",    // Slightly darker for dark mode
        // Add subtle blur for smoothness
        "before:blur-[1px]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }