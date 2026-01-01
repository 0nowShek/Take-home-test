"use client"

import { useState } from "react"
import { RefreshCw, Clock, Zap, Coffee, Timer, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface RetryModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: (minutes: number) => void
  reminderTitle: string
}

const RETRY_OPTIONS = [
  { 
    label: "5 minutes", 
    sublabel: "Quick retry",
    minutes: 5, 
    icon: Zap,
    color: "text-blue-500 dark:text-blue-400"
  },
  { 
    label: "15 minutes", 
    sublabel: "Short break",
    minutes: 15, 
    icon: Coffee,
    color: "text-purple-500 dark:text-purple-400"
  },
  { 
    label: "1 hour", 
    sublabel: "Try later",
    minutes: 60, 
    icon: Clock,
    color: "text-orange-500 dark:text-orange-400"
  },
]

export function RetryModal({
  isOpen,
  onClose,
  onRetry,
  reminderTitle,
}: RetryModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customHours, setCustomHours] = useState(0)
  const [customMinutes, setCustomMinutes] = useState(30)

  const handleRetry = () => {
    let minutesToRetry = selectedMinutes

    if (showCustom) {
      minutesToRetry = customHours * 60 + customMinutes
      if (minutesToRetry <= 0) {
        return
      }
    }

    if (minutesToRetry) {
      onRetry(minutesToRetry)
      handleClose()
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSelectedMinutes(null)
      setShowCustom(false)
      setCustomHours(0)
      setCustomMinutes(30)
    }, 200)
  }

  const getRetryTime = (minutes: number) => {
    const now = new Date()
    const retryTime = new Date(now.getTime() + minutes * 60000)
    
    const timeStr = retryTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
    
    const isToday = retryTime.toDateString() === now.toDateString()
    
    if (!isToday) {
      const dateStr = retryTime.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      })
      return `${dateStr} at ${timeStr}`
    }
    
    return `Today at ${timeStr}`
  }

  const getCustomRetryTime = () => {
    const totalMinutes = customHours * 60 + customMinutes
    if (totalMinutes <= 0) return "Select a time"
    return getRetryTime(totalMinutes)
  }

  const handleCustomClick = () => {
    setShowCustom(true)
    setSelectedMinutes(null)
  }

  const handlePresetClick = (minutes: number) => {
    setSelectedMinutes(minutes)
    setShowCustom(false)
  }

  const isCustomValid = customHours > 0 || customMinutes > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden px-6 pt-6 pb-4 space-y-3">
        {/* Header with padding */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/30">
              <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            Retry Reminder
          </DialogTitle>
          <DialogDescription className="text-base">
            Schedule another attempt for <span className="font-medium text-foreground">"{reminderTitle}"</span>
          </DialogDescription>
        </DialogHeader>

        {/* Options with padding */}
        <div className="px-6 py-2 space-y-3">
          {/* Preset Options */}
          {RETRY_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = selectedMinutes === option.minutes && !showCustom
            
            return (
              <button
                key={option.minutes}
                onClick={() => handlePresetClick(option.minutes)}
                className={cn(
                  "w-full group relative overflow-hidden",
                  "flex items-center justify-between p-4 rounded-xl border-2",
                  "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                  isSelected
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 shadow-lg shadow-orange-500/20"
                    : "border-border hover:border-orange-200 dark:hover:border-orange-900 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  "bg-gradient-to-r from-transparent via-orange-50/50 to-transparent dark:via-orange-950/20"
                )} />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "p-3 rounded-lg transition-colors duration-300",
                    isSelected 
                      ? "bg-orange-100 dark:bg-orange-900/40" 
                      : "bg-muted group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20"
                  )}>
                    <Icon className={cn("h-5 w-5", option.color)} />
                  </div>
                  
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-base">
                      {option.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {option.sublabel} • {getRetryTime(option.minutes)}
                    </p>
                  </div>
                </div>

                <div className="relative z-10">
                  {isSelected ? (
                    <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-border group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-colors" />
                  )}
                </div>
              </button>
            )
          })}

          {/* Custom Option */}
          <button
            onClick={handleCustomClick}
            className={cn(
              "w-full group relative overflow-hidden",
              "flex items-center justify-between p-4 rounded-xl border-2",
              "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
              showCustom
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 shadow-lg shadow-orange-500/20"
                : "border-border hover:border-orange-200 dark:hover:border-orange-900 hover:shadow-md"
            )}
          >
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "bg-gradient-to-r from-transparent via-orange-50/50 to-transparent dark:via-orange-950/20"
            )} />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn(
                "p-3 rounded-lg transition-colors duration-300",
                showCustom 
                  ? "bg-orange-100 dark:bg-orange-900/40" 
                  : "bg-muted group-hover:bg-orange-50 dark:group-hover:bg-orange-950/20"
              )}>
                <Settings2 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              
              <div className="text-left">
                <p className="font-semibold text-foreground text-base">
                  Custom time
                </p>
                <p className="text-sm text-muted-foreground">
                  Set your own schedule
                </p>
              </div>
            </div>

            <div className="relative z-10">
              {showCustom ? (
                <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                  <div className="h-2.5 w-2.5 rounded-full bg-white" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-border group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-colors" />
              )}
            </div>
          </button>

          {/* Custom Time Inputs */}
          {showCustom && (
            <div className="p-5 rounded-xl bg-muted/50 border border-border space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>Set custom time</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Hours
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="48"
                    value={customHours}
                    onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-center text-lg font-semibold h-12"
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Minutes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="text-center text-lg font-semibold h-12"
                    placeholder="0"
                  />
                </div>
              </div>

              {isCustomValid && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
                  <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Will retry: <span className="font-medium text-foreground">{getCustomRetryTime()}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions with padding */}
        <div className="flex gap-3 px-6 py-6 bg-muted/30 border-t mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRetry}
            disabled={!selectedMinutes && (!showCustom || !isCustomValid)}
            className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Schedule Retry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}