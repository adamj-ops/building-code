"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Search,
  Map,
  FileText,
  Calculator,
  History,
  Settings,
  BookOpen,
  Building2
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { href: "/", icon: Search, label: "Search" },
  { href: "/jurisdictions", icon: Map, label: "Jurisdictions" },
  { href: "/codes", icon: BookOpen, label: "Browse Codes" },
  { href: "/permits/analyzer", icon: FileText, label: "Permit Analyzer" },
  { href: "/fees", icon: Calculator, label: "Fee Calculator" },
  { href: "/history", icon: History, label: "History" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-screen w-16 flex-col items-center border-r border-sidebar-border bg-sidebar py-4 sticky top-0">
        {/* Logo */}
        <Link href="/" className="mb-8">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            "bg-emerald-500/10 text-emerald-400",
            "transition-colors duration-150",
            "hover:bg-emerald-500/20"
          )}>
            <Building2 className="h-5 w-5" />
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      // Base styles
                      "relative flex h-10 w-10 items-center justify-center rounded-lg",
                      // Transition
                      "transition-all duration-150",
                      // States
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-emerald-400" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={8}
                  className="bg-popover text-popover-foreground border-border"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  "transition-all duration-150"
                )}
              >
                <Settings className="h-[18px] w-[18px]" />
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              sideOffset={8}
              className="bg-popover text-popover-foreground border-border"
            >
              Settings
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
