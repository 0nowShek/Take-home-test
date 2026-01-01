"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/providers/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Select
} from "@/components/ui/select"

/**
 * Theme Toggle Button
 * 
 * Shows current theme icon, cycles through themes on click.
 * Light -> Dark -> System -> Light
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />
      case "dark":
        return <Moon className="h-5 w-5" />
      case "system":
        return <Monitor className="h-5 w-5" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      case "system":
        return "System"
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      title={`Current theme: ${getLabel()}. Click to cycle.`}
      aria-label={`Switch theme. Current: ${getLabel()}`}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

/**
 * Theme Toggle Dropdown
 * 
 * Dropdown version with explicit theme selection.
 * Better for settings pages or when you want explicit choice.
 */
export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Theme:</span>
      <Select
        value={theme}
        onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </Select>
    </div>
  )
}

/**
 * Theme Toggle Segmented Control
 * 
 * Premium three-button toggle.
 * Shows all options at once - best UX.
 */
export function ThemeToggleSegmented() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="inline-flex items-center rounded-md border bg-background p-1">
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("light")}
        className="gap-2"
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">Light</span>
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="gap-2"
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">Dark</span>
      </Button>
      <Button
        variant={theme === "system" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("system")}
        className="gap-2"
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">Auto</span>
      </Button>
    </div>
  )
}