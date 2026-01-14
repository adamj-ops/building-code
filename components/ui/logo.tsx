import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4", 
  md: "w-5 h-5",
  lg: "w-6 h-6",
}

/**
 * Simple filled square logo
 */
export function Logo({ size = "sm", className }: LogoProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-[3px]",
        sizeMap[size],
        className
      )}
      aria-hidden="true"
    />
  )
}
