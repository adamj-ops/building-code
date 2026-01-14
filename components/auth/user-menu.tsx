"use client"

import { useRouter } from "next/navigation"
import { signOut } from "@/lib/supabase/auth"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, History } from "lucide-react"

export function UserMenu() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/login")}
        className="bg-transparent border-neutral-800 text-white hover:bg-neutral-800"
      >
        Sign in
      </Button>
    )
  }

  const initials = user.email
    ? user.email
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full bg-neutral-800 hover:bg-neutral-700"
          aria-label="User menu"
        >
          <span className="text-sm font-medium text-white">{initials}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-background border-border"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">Account</p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={() => router.push("/history")}
          className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        >
          <History className="mr-2 h-4 w-4" />
          <span>History</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-400 hover:text-red-300 hover:bg-muted cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
