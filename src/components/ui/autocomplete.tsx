"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Autocomplete({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="autocomplete"
      className={cn("relative w-full", className)}
      {...props}
    />
  )
}

function AutocompleteInput({
  className,
  clearable = false,
  onClear,
  trailingIcon,
  ...props
}: React.ComponentProps<"input"> & {
  clearable?: boolean
  onClear?: () => void
  trailingIcon?: React.ReactNode
}) {
  const hasValue =
    typeof props.value === "string"
      ? props.value.length > 0
      : Array.isArray(props.value)
        ? props.value.length > 0
        : false

  return (
    <div className="relative">
      <input
        data-slot="autocomplete-input"
        className={cn(
          "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
          className
        )}
        {...props}
      />

      {clearable && hasValue && !props.disabled ? (
        <button
          type="button"
          aria-label="Clear input"
          className="absolute top-1/2 right-3 inline-flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onClear?.()}
        >
          <X className="size-4" />
        </button>
      ) : trailingIcon ? (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  )
}

function AutocompleteContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="autocomplete-content"
      className={cn(
        "absolute inset-x-0 top-[calc(100%+0.375rem)] z-50 overflow-hidden rounded-md bg-popover/70 text-popover-foreground shadow-md ring-1 ring-foreground/10 backdrop-blur-2xl backdrop-saturate-150",
        className
      )}
      {...props}
    />
  )
}

function AutocompleteList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="autocomplete-list"
      className={cn("grid max-h-88 overflow-y-auto p-1", className)}
      {...props}
    />
  )
}

function AutocompleteItem({
  className,
  active = false,
  selected = false,
  ...props
}: React.ComponentProps<"button"> & {
  active?: boolean
  selected?: boolean
}) {
  return (
    <button
      type="button"
      data-slot="autocomplete-item"
      data-active={active}
      data-selected={selected}
      className={cn(
        "relative flex w-full items-start justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors",
        active || selected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/60",
        className
      )}
      {...props}
    />
  )
}

function AutocompleteEmpty({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="autocomplete-empty"
      className={cn("px-3 py-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
}
