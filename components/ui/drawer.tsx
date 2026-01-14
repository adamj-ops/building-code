"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: "left" | "right" | "top" | "bottom"
  className?: string
}

export function Drawer({ open, onOpenChange, children, side = "right", className }: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const sideClasses = {
    right: "right-0 top-0 h-full translate-x-0 data-[state=closed]:translate-x-full",
    left: "left-0 top-0 h-full translate-x-0 data-[state=closed]:-translate-x-full",
    top: "top-0 left-0 w-full translate-y-0 data-[state=closed]:-translate-y-full",
    bottom: "bottom-0 left-0 w-full translate-y-0 data-[state=closed]:translate-y-full",
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed z-50 w-full max-w-lg bg-background border-l border-border shadow-lg transition-transform duration-300 ease-in-out",
          sideClasses[side],
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-full flex-col">
          {children}
        </div>
      </div>
    </>
  )
}

interface DrawerHeaderProps {
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

export function DrawerHeader({ children, onClose, className }: DrawerHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between border-b border-border px-6 py-4", className)}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
}

interface DrawerContentProps {
  children: React.ReactNode
  className?: string
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-4", className)}>
      {children}
    </div>
  )
}
