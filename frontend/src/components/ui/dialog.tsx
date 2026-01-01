"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // Close on Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    
    if (open) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <div className="relative z-50 animate-in zoom-in-95 fade-in duration-200">
        {children}
      </div>
    </div>
  )
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

export function DialogContent({ className, children }: DialogContentProps) {
  return (
    <div
      className={cn(
        "relative bg-card rounded-lg shadow-lg border",
        "w-full max-w-lg mx-4",
        "max-h-[90vh] overflow-y-auto",
        className
      )}
      onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
    >
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
  onClose?: () => void
}

export function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  )
}

interface DialogBodyProps {
  children: React.ReactNode
  className?: string
}

export function DialogBody({ children, className }: DialogBodyProps) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  )
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className }: DialogFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 p-6 border-t", className)}>
      {children}
    </div>
  )
}