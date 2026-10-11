"use client"

import { Editor } from "@tinymce/tinymce-react"
import "tinymce/tinymce"
import "tinymce/models/dom"
import "tinymce/themes/silver"
import "tinymce/icons/default"
import "tinymce/plugins/lists"
import "tinymce/plugins/link"
import "tinymce/plugins/table"
import "tinymce/plugins/code"
import "tinymce/plugins/wordcount"
import "tinymce/skins/ui/oxide/skin.min.css"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  className?: string
}

const PEYDA_FACES = [
  [100, "Thin"],
  [200, "ExtraLight"],
  [300, "Light"],
  [400, "Regular"],
  [500, "Medium"],
  [600, "SemiBold"],
  [700, "Bold"],
  [800, "ExtraBold"],
  [900, "Black"],
  [950, "ExtraBlack"],
] as const

const PEYDA = PEYDA_FACES.map(
  ([weight, file]) =>
    `@font-face{font-family:PeydaWeb;src:url(/fonts/Peyda/PeydaWeb-${file}.woff2) format("woff2");font-weight:${weight};font-style:normal;font-display:swap}`,
).join("")

const INIT = {
  height: 280,
  menubar: false,
  branding: false,
  promotion: false,
  statusbar: true,
  elementpath: false,
  directionality: "rtl" as const,
  skin: false,
  content_css: false,
  font_family_formats: "Peyda=PeydaWeb,sans-serif",
  plugins: "lists link table code wordcount",
  toolbar:
    "undo redo | blocks | bold italic underline strikethrough | forecolor | alignright aligncenter alignleft | bullist numlist | link table | removeformat code",
  content_style: `${PEYDA}body,body *{font-family:PeydaWeb,sans-serif!important}body{font-size:15px;line-height:1.8;direction:rtl;color:#171717}`,
}

export function RichTextEditor({ value, onChange, disabled = false, className }: Props) {
  return (
    <div className={cn("rich-text-editor overflow-hidden rounded-2xl border border-input bg-background", className)}>
      <Editor licenseKey="gpl" value={value} disabled={disabled} init={INIT} onEditorChange={onChange} />
    </div>
  )
}
