import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle } from "lucide-react"
import { useCountdown } from "@/hooks/use-countdown"
import { cn } from "@/lib/utils"

interface CountdownBadgeProps {
  scheduledTime: string
  className?: string
  showIcon?: boolean
}

export function CountdownBadge({ 
  scheduledTime, 
  className,
  showIcon = true 
}: CountdownBadgeProps) {
  const countdown = useCountdown(scheduledTime)

  // Choose icon based on urgency
  const Icon = countdown.totalMinutes < 15 ? AlertCircle : Clock

  return (
    <div 
      className={cn(
        "flex items-center gap-2 text-sm font-medium",
        className
      )}
    >
      {showIcon && (
        <Icon 
          className={cn(
            "h-3 w-3",
            countdown.totalMinutes < 15 && "animate-pulse text-destructive"
          )} 
        />
      )}
      <Badge 
        variant={countdown.variant}
        className={cn(
          "transition-all duration-300",
          // Pulse for very urgent
          countdown.totalMinutes < 15 && "animate-pulse",
          // Slightly larger for urgent
          countdown.totalMinutes < 60 && "font-semibold"
        )}
      >
        {countdown.text}
      </Badge>
    </div>
  )
}