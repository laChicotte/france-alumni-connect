"use client"

import { useEffect, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import { Color } from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import { Extension } from "@tiptap/core"
import { Button } from "@/components/ui/button"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CornerDownLeft,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react"

const LINE_HEIGHT_OPTIONS = [
  { label: "Serré (1)", value: "1" },
  { label: "Normal (1.5)", value: "1.5" },
  { label: "Aéré (1.75)", value: "1.75" },
  { label: "Double (2)", value: "2" },
]

// Extension interligne personnalisée
const LineHeight = Extension.create({
  name: "lineHeight",
  addOptions() {
    return { types: ["paragraph", "heading"] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes.lineHeight) return {}
              return { style: `line-height: ${attributes.lineHeight}` }
            },
          },
        },
      },
    ]
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      setLineHeight:
        (lineHeight: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: { commands: any }) => {
          return (this.options.types as string[]).every((type: string) =>
            commands.updateAttributes(type, { lineHeight })
          )
        },
      unsetLineHeight:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ commands }: { commands: any }) => {
          return (this.options.types as string[]).every((type: string) =>
            commands.resetAttributes(type, "lineHeight")
          )
        },
    }
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const isInternalUpdate = useRef(false)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      LineHeight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: currentEditor }) => {
      isInternalUpdate.current = true
      onChange(currentEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] rounded-md border border-input bg-background px-3 py-3 text-base focus-visible:outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-3 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  const toolbarButtonClass = (isActive: boolean) =>
    isActive ? "bg-[#3558A2] text-white hover:bg-[#3558A2]/90" : ""

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL du lien", previousUrl || "")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const currentColor = editor.getAttributes("textStyle").color as string | undefined
  const currentLineHeight =
    (editor.getAttributes("paragraph").lineHeight as string | undefined) ||
    (editor.getAttributes("heading").lineHeight as string | undefined) ||
    ""

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Mise en forme */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("bold"))}
          title="Gras"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("italic"))}
          title="Italique"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("underline"))}
          title="Souligné"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        {/* Titres */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("heading", { level: 1 }))}
          title="Titre 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("heading", { level: 2 }))}
          title="Titre 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("heading", { level: 3 }))}
          title="Titre 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        {/* Listes & citation */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("bulletList"))}
          title="Liste à puces"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("orderedList"))}
          title="Liste numérotée"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("blockquote"))}
          title="Citation"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        {/* Alignement */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive({ textAlign: "left" }))}
          title="Aligner à gauche"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive({ textAlign: "center" }))}
          title="Centrer"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive({ textAlign: "right" }))}
          title="Aligner à droite"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive({ textAlign: "justify" }))}
          title="Justifier"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        {/* Lien */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={toolbarButtonClass(editor.isActive("link"))}
          title="Lien"
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </Button>

        {/* Saut de ligne */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          title="Saut de ligne (Shift+Entrée)"
          onClick={() => editor.chain().focus().setHardBreak().run()}
        >
          <CornerDownLeft className="h-4 w-4" />
        </Button>

        {/* Séparateur */}
        <div className="w-px h-7 bg-border mx-1" />

        {/* Couleur du texte */}
        <div className="relative h-8 w-8" title="Couleur du texte">
          <button
            type="button"
            className="h-8 w-8 flex flex-col items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors overflow-hidden gap-0.5 pt-1"
          >
            <span
              className="font-bold text-sm leading-none"
              style={{ color: currentColor || "currentColor" }}
            >
              A
            </span>
            <span
              className="w-5 h-[3px] rounded-sm"
              style={{ backgroundColor: currentColor || "#000000" }}
            />
          </button>
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            value={currentColor || "#000000"}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            title="Couleur du texte"
          />
        </div>

        {/* Réinitialiser la couleur */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          title="Réinitialiser la couleur"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="text-xs font-bold px-2 line-through"
        >
          A
        </Button>

        {/* Interligne */}
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-sm cursor-pointer"
          value={currentLineHeight}
          onChange={(e) => {
            if (e.target.value) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(editor.chain().focus() as any).setLineHeight(e.target.value).run()
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(editor.chain().focus() as any).unsetLineHeight().run()
            }
          }}
          title="Interligne"
        >
          <option value="">Interligne</option>
          {LINE_HEIGHT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
