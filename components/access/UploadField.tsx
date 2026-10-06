"use client"

import { useEffect, useMemo } from "react"
import { ImageIcon } from "@phosphor-icons/react"

function usePreview(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])
  return url
}

export function UploadField({
  label,
  file,
  current,
  onPick,
  square = false,
  contain = false,
}: {
  label: string
  file: File | null
  current?: string
  onPick: (file: File | null) => void
  square?: boolean
  contain?: boolean
}) {
  const url = usePreview(file) || current || null

  return (
    <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-primary/50 bg-white px-3 py-4 text-center transition-colors hover:border-primary hover:bg-primary/5 ${square ? "mx-auto aspect-square w-48 shrink-0" : "min-h-36 w-full"}`}>
      {url ? (
        <img
          src={url}
          alt=""
          className={
            contain
              ? "max-h-56 w-full rounded-xl object-contain"
              : square
                ? "size-20 rounded-xl object-cover"
                : "h-20 w-full rounded-xl object-cover"
          }
        />
      ) : (
        <span className="grid size-10 place-items-center rounded-full bg-white text-primary shadow-[0_0_0_1px_#e6eadf]">
          <ImageIcon className="size-5" />
        </span>
      )}
      <span className="text-xs font-medium text-[#3d4336]">{file ? "عوض کردن تصویر" : label}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => onPick(event.target.files?.[0] ?? null)}
      />
    </label>
  )
}
