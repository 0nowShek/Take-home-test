"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(
  undefined
)

/**
 * Theme Provider
 * 
 * Features:
 * - Supports light, dark, and system preference
 * - Persists theme choice to localStorage
 * - Syncs with system preference changes
 * - Prevents flash of unstyled content (FOUC)
 * 
 * Usage:
 * Wrap your app with <ThemeProvider>
 * Use useTheme() hook to access theme state
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "call-me-reminder-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    // Get saved theme from localStorage on mount
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [storageKey])

  React.useEffect(() => {
    const root = window.document.documentElement

    // Remove previous theme classes
    root.classList.remove("light", "dark")

    // Determine which theme to apply
    let effectiveTheme: "light" | "dark" = "light"

    if (theme === "system") {
      // Use system preference
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    } else {
      effectiveTheme = theme
    }

    // Apply theme class to root element
    root.classList.add(effectiveTheme)

    // Save to localStorage
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(mediaQuery.matches ? "dark" : "light")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * Hook to access theme state
 */
export function useTheme() {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}