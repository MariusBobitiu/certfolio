"use client"

import { HexColorPicker } from "react-colorful"
import { Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

type ColorPickerProps = {
  value: string
  onChange: (hex: string) => void
  className?: string
}

/** Check whether a hex colour is one of the preset values. If so, the preset dot handles the display and this picker falls back to gradient. */
function isPreset(value: string): boolean {
  const presets = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#71717a",
  ]
  return presets.includes(value)
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const showGradient = isPreset(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex size-4 items-center justify-center overflow-hidden rounded-full ring-1 ring-border/60 hover:ring-muted-foreground/50",
            showGradient
              ? "bg-linear-to-br from-red-400 via-purple-400 to-blue-400"
              : "",
            className
          )}
          style={!showGradient ? { backgroundColor: value } : undefined}
          aria-label="Pick a custom colour"
        >
          {showGradient && (
            <Palette className="size-2 text-white drop-shadow-sm" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-auto p-3">
        <HexColorPicker color={value} onChange={onChange} />
        <div className="mt-3 flex items-center gap-2">
          <div
            className="size-6 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: value }}
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 font-mono text-xs"
            placeholder="#000000"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
