import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles with touch-friendly height
        "h-9 min-h-[44px] sm:min-h-0 w-full min-w-0 rounded-md border px-3 py-1 text-sm",
        // Colors
        "bg-background border-border text-foreground",
        "placeholder:text-muted-foreground",
        // Transitions
        "transition-colors duration-150 ease-out",
        // Hover state
        "hover:border-border-emphasis",
        // Focus state - visible for accessibility
        "focus:outline-none focus:border-border-emphasis focus:ring-2 focus:ring-ring/20",
        "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        // Selection
        "selection:bg-primary/20 selection:text-foreground",
        // File input styling
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/50",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
