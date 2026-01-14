"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { UserMenu } from "@/components/auth"

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Comps" },
    { href: "/rehab", label: "Rehab" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between px-6 bg-background border-b border-neutral-800">
      {/* Left - Logo */}
      <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
        <Logo size="md" />
      </Link>

      {/* Right - Nav Links + User Avatar */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}
