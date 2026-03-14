"use client"

import { useEffect, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"

import { updatePrivacyAction } from "./action"
import type { UpdatePrivacyInput } from "./schema"

const PRIVACY_TOGGLES: {
  key: keyof UpdatePrivacyInput
  label: string
  description: string
}[] = [
  {
    key: "public_profile",
    label: "Public Profile",
    description: "Allow anyone to view your profile",
  },
  {
    key: "searchable",
    label: "Searchable Profile",
    description: "Allow your profile to appear in search results",
  },
  {
    key: "show_email",
    label: "Show Email Address",
    description: "Display your email on your public profile",
  },
  {
    key: "full_metadata",
    label: "Full Credential Metadata",
    description:
      "Show full credential details instead of a summary on your profile",
  },
]

export function PrivacyForm({
  defaultValues,
}: {
  defaultValues: UpdatePrivacyInput
}) {
  const [values, setValues] = useState(defaultValues)
  const { execute, isPending, result } = useAction(updatePrivacyAction)

  useEffect(() => {
    if (result.data?.success) {
      toast.success(result.data.success)
    }
    if (result.data?.failure) {
      toast.error(result.data.failure)
    }
  }, [result])

  const toggle = (key: keyof UpdatePrivacyInput) => {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Privacy & Visibility</h2>
        <p className="text-sm text-muted-foreground">
          Control who can see your profile and information.
        </p>
      </div>

      <div className="space-y-3">
        {PRIVACY_TOGGLES.map((toggle_item) => (
          <div
            key={toggle_item.key}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="text-sm font-medium">{toggle_item.label}</p>
              <p className="text-xs text-muted-foreground">
                {toggle_item.description}
              </p>
            </div>
            <Switch
              checked={values[toggle_item.key]}
              onCheckedChange={() => toggle(toggle_item.key)}
              disabled={isPending}
            />
          </div>
        ))}
      </div>

      <Button onClick={() => execute(values)} disabled={isPending}>
        {isPending && <Spinner className="size-4" />}
        Save Privacy Settings
      </Button>
    </div>
  )
}
