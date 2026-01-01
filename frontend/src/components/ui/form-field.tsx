import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

/**
 * FormField provides consistent spacing and error handling for form inputs
 * 
 * This wrapper ensures:
 * - Consistent label/input spacing
 * - Error message display
 * - Helper text support
 * - Required indicator
 * 
 * Usage:
 * <FormField 
 *   label="Email" 
 *   error="Email is required"
 *   required
 * >
 *   <Input type="email" />
 * </FormField>
 */
interface FormFieldProps {
  label: string
  error?: string
  helperText?: string
  required?: boolean
  htmlFor?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  error,
  helperText,
  required,
  htmlFor,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm font-medium text-destructive animate-in fade-in-50 duration-200">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
}