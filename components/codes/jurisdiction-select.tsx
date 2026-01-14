"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Sample data - will be replaced with Supabase query
const metroJurisdictions = [
  { value: "minneapolis", label: "Minneapolis", county: "Hennepin" },
  { value: "st-paul", label: "St. Paul", county: "Ramsey" },
  { value: "bloomington", label: "Bloomington", county: "Hennepin" },
  { value: "brooklyn-park", label: "Brooklyn Park", county: "Hennepin" },
  { value: "plymouth", label: "Plymouth", county: "Hennepin" },
  { value: "maple-grove", label: "Maple Grove", county: "Hennepin" },
  { value: "woodbury", label: "Woodbury", county: "Washington" },
  { value: "eagan", label: "Eagan", county: "Dakota" },
  { value: "eden-prairie", label: "Eden Prairie", county: "Hennepin" },
  { value: "burnsville", label: "Burnsville", county: "Dakota" },
]

const counties = [
  { value: "hennepin", label: "Hennepin County" },
  { value: "ramsey", label: "Ramsey County" },
  { value: "dakota", label: "Dakota County" },
  { value: "anoka", label: "Anoka County" },
  { value: "washington", label: "Washington County" },
  { value: "scott", label: "Scott County" },
  { value: "carver", label: "Carver County" },
]

interface JurisdictionSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  className?: string
}

export function JurisdictionSelect({ 
  value, 
  onChange, 
  placeholder = "All Minnesota",
  className 
}: JurisdictionSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedJurisdiction = [...metroJurisdictions, ...counties].find(
    (j) => j.value === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none outline-none cursor-pointer",
            className
          )}
        >
          <span className="truncate max-w-[120px]">
            {selectedJurisdiction?.label || placeholder}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search jurisdictions..." />
          <CommandList>
            <CommandEmpty>No jurisdiction found.</CommandEmpty>
            
            {/* Clear selection */}
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                All Minnesota
                {!value && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
            </CommandGroup>

            {/* Metro Cities */}
            <CommandGroup heading="Metro Cities">
              {metroJurisdictions.map((jurisdiction) => (
                <CommandItem
                  key={jurisdiction.value}
                  value={jurisdiction.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? null : currentValue)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span>{jurisdiction.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {jurisdiction.county}
                    </span>
                  </div>
                  {value === jurisdiction.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Counties */}
            <CommandGroup heading="Counties">
              {counties.map((county) => (
                <CommandItem
                  key={county.value}
                  value={county.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? null : currentValue)
                    setOpen(false)
                  }}
                >
                  {county.label}
                  {value === county.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
