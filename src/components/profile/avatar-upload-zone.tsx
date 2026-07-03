"use client"

import { useCallback, useState } from "react"
import Image from "next/image"
import { useDropzone, type FileRejection } from "react-dropzone"
import { Camera, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

type AvatarUploadZoneProps = {
  currentImageUrl: string | null
  name: string
  previewUrl: string | null
  onFileSelectAction: (file: File) => void
  onErrorAction?: (message: string) => void
}

export function AvatarUploadZone({
  currentImageUrl,
  name,
  previewUrl,
  onFileSelectAction,
  onErrorAction,
}: AvatarUploadZoneProps) {
  const [isHovering, setIsHovering] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const error = fileRejections[0]?.errors[0]
        if (error?.code === "file-too-large") {
          onErrorAction?.("Image must be under 5MB")
        } else if (error?.code === "file-invalid-type") {
          onErrorAction?.("Only JPG, PNG, or WebP files")
        }
        return
      }
      if (acceptedFiles.length > 0) {
        onFileSelectAction(acceptedFiles[0]!)
      }
    },
    [onFileSelectAction, onErrorAction]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
  })

  const displayImage = previewUrl ?? currentImageUrl

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-200",
        "size-28 sm:size-32",
        isDragActive
          ? "border-primary bg-primary/5"
          : isHovering
            ? "border-primary/60 bg-secondary/60"
            : "border-border/60 bg-secondary/40"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <input {...getInputProps()} />

      {displayImage ? (
        <>
          <Image
            unoptimized
            src={displayImage}
            alt={name}
            fill
            className="object-cover"
          />
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-200",
              isHovering || isDragActive ? "opacity-100" : "opacity-0"
            )}
          >
            <Camera className="size-5 text-white" />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <Upload className="size-4 text-primary" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            Photo
          </span>
        </div>
      )}
    </div>
  )
}

export { getInitials }
