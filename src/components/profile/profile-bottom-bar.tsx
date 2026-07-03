"use client"

import Link from "next/link"
import { ExternalLink, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"

type ProfileBottomBarProps = {
  isDirty: boolean
  isSaving: boolean
  onSaveAction: () => Promise<void>
  publicSlug: string
}

export function ProfileBottomBar({
  isDirty,
  isSaving,
  onSaveAction,
  publicSlug,
}: ProfileBottomBarProps) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-end gap-2">
        {isDirty && (
          <span className="mr-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            Unsaved
          </span>
        )}

        <Button
          onClick={onSaveAction}
          disabled={!isDirty || isSaving}
          size="sm"
          className="gap-1.5"
        >
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          Save
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link
            href={`/u/${publicSlug}` as const}
            target="_blank"
            className="gap-1.5"
          >
            <ExternalLink className="size-3.5" />
            View
          </Link>
        </Button>
      </div>
    </div>
  )
}
