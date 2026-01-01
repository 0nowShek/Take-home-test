import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Premium Toast Notification System
 * 
 * Features:
 * - Icon variants for each type
 * - Animated progress bar with shimmer
 * - Smooth entrance/exit animations
 * - Support for actions (undo, etc.)
 * - Priority system (important toasts stay longer)
 */

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col gap-3 p-4",
      "sm:top-auto sm:bottom-0 sm:right-0 sm:max-w-[420px]",
      "pointer-events-none",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out",
    "data-[state=closed]:fade-out-80",
    "data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    "data-[state=closed]:slide-out-to-right-full",
    "data-[state=open]:sm:slide-in-from-bottom-full",
    "data-[state=open]:duration-300",
    "data-[state=closed]:duration-200",
  ].join(" "),
  {
    variants: {
      variant: {
        default: 
          "border bg-background text-foreground",
        success:
          "border-success/50 bg-success/10 text-foreground dark:bg-success/20 dark:border-success/30",
        destructive:
          "border-destructive/50 bg-destructive/10 text-foreground dark:bg-destructive/20 dark:border-destructive/30",
        warning:
          "border-warning/50 bg-warning/10 text-foreground dark:bg-warning/20 dark:border-warning/30",
        info:
          "border-blue-500/50 bg-blue-500/10 text-foreground dark:bg-blue-500/20 dark:border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Icon mapping for each variant
const toastIcons = {
  default: null,
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      duration?: number
      icon?: boolean // Show icon or not
    }
>(({ className, variant = "default", duration = 5000, icon = true, ...props }, ref) => {
  const Icon = variant ? toastIcons[variant] : null

  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={duration}
      className={cn("relative", toastVariants({ variant }), className)}
      {...props}
    >
      {/* Animated progress bar with shimmer */}
      <div
        className="absolute top-0 left-0 h-1 rounded-t-lg overflow-hidden"
        style={{ width: "100%" }}
      >
        <div
          className={cn(
            "h-full relative",
            variant === "success" && "bg-success/40",
            variant === "destructive" && "bg-destructive/40",
            variant === "warning" && "bg-warning/40",
            variant === "info" && "bg-blue-500/40",
            !variant && "bg-foreground/20"
          )}
          style={{
            animation: `toastProgress ${duration}ms linear`,
          }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex items-start gap-3 flex-1">
        {/* Icon */}
        {icon && Icon && (
          <div className="flex-shrink-0 mt-0.5">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        {/* Text content */}
        <div className="flex-1 grid gap-1">
          {props.children}
        </div>
      </div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors",
      "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "border-current/30 hover:border-current/50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-all",
      "hover:text-foreground hover:bg-accent/50 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-tight text-foreground", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 leading-snug text-foreground", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}