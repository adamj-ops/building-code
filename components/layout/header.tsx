"use client"

import Link from "next/link"
import { Moon, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { UserMenu } from "@/components/auth"

interface HeaderProps {
  address?: string
  zillowUrl?: string
}

export function Header({ address, zillowUrl }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      {/* Left - Logo & Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Logo size="sm" />
          <span className="text-base font-semibold text-foreground tracking-tight">Property Analyzer</span>
        </Link>
      </div>

      {/* Center - Address (if provided) */}
      {address && (
        <div className="flex items-center gap-4">
          <span className="text-foreground font-medium">{address}</span>
          {zillowUrl && (
            <a
              href={zillowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1"
            >
              View on Zillow
            </a>
          )}
        </div>
      )}

      {/* Right - Actions */}
      <div className="flex items-center gap-1">
        {/* Cmd+K Search */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
        >
          <Command className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Cmd+K</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          mode="icon"
          size="sm"
          className="text-muted-foreground"
          aria-label="Toggle theme"
        >
          <Moon className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
