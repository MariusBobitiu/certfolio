"use client"

import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Palette } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { updateAppearanceAction } from "./action"
import { ACCENT_COLOURS } from "./schema"

const COLOUR_CLASSES: Record<(typeof ACCENT_COLOURS)[number], string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  pink: "bg-pink-500",
  zinc: "bg-zinc-500",
}

export function AppearanceForm({
  currentColour,
}: {
  currentColour: (typeof ACCENT_COLOURS)[number]
}) {
  const [selected, setSelected] = useState(currentColour)
  const { execute, isPending, result } = useAction(updateAppearanceAction)

  useEffect(() => {
    if (result.data?.success) {
      toast.success(result.data.success)
    }
    if (result.data?.failure) {
      toast.error(result.data.failure)
    }
  }, [result])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customise how Certfolio looks.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3 mb-1">
            <Palette className="size-5 text-muted-foreground" />
            <p className="text-sm font-medium">Theme</p>
          </div>
          <p className="text-xs text-muted-foreground ml-8">
            Use the theme switcher in the navbar to toggle between light and
            dark mode.
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Profile Accent Colour</p>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLOURS.map((colour) => (
              <button
                key={colour}
                type="button"
                onClick={() => setSelected(colour)}
                className={cn(
                  "size-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                  COLOUR_CLASSES[colour],
                  selected === colour
                    ? "ring-foreground scale-110"
                    : "ring-transparent hover:ring-muted-foreground/50"
                )}
                aria-label={colour}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            Selected: {selected}
          </p>
        </div>
      </div>

      <Button
        onClick={() => execute({ accent_colour: selected })}
        disabled={isPending || selected === currentColour}
      >
        {isPending && <Spinner className="size-4" />}
        Save Appearance
      </Button>
    </div>
  )
}
