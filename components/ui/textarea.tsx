import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex field-sizing-content min-h-24 w-full rounded-md border px-3 py-2 text-sm",
        // Colors
        "bg-background border-border text-foreground",
        "placeholder:text-muted-foreground",
        // Transitions
        "transition-colors duration-150 ease-out",
        // Hover state
        "hover:border-border-emphasis",
        // Focus state - subtle and clean
        "focus:outline-none focus:border-border-emphasis focus:ring-2 focus:ring-ring/10",
        // Selection
        "selection:bg-primary/20 selection:text-foreground",
        // Resize
        "resize-none",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/50",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
