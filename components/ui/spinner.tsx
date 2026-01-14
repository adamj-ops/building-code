import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SpinnerProps extends React.ComponentProps<"svg"> {
  size?: "sm" | "md" | "lg"
}

function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  }

  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(
        sizeClasses[size],
        "animate-spin text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
