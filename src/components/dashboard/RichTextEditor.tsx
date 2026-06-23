'use client'

import { useEffect, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Undo2,
  Redo2,
} from 'lucide-react'

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  placeholder?: string
  insertTokens?: string[]
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors disabled:opacity-40 ${
        active ? 'bg-[#2563eb] text-white' : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder,
  insertTokens = [],
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: 'color:#2563eb;text-decoration:none;',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write the email body…',
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'email-rich-text-editor min-h-[300px] px-4 py-3 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== value) {
      editor.commands.setContent(value, false)
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  if (!editor) {
    return <div className="min-h-[360px] animate-pulse rounded-xl border-2 border-gray-200 bg-gray-50" />
  }

  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-200 focus-within:border-[#2563eb]">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <ToolbarButton
          title="Bold"
          disabled={disabled}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          disabled={disabled}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          disabled={disabled}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading"
          disabled={disabled}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          disabled={disabled}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          disabled={disabled}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Undo"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        {insertTokens.length > 0 && (
          <select
            disabled={disabled}
            defaultValue=""
            onChange={(e) => {
              const token = e.target.value
              if (!token) return
              editor.chain().focus().insertContent(token).run()
              e.target.value = ''
            }}
            className="ml-auto rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700"
          >
            <option value="">Insert placeholder…</option>
            {insertTokens.map((token) => (
              <option key={token} value={token}>
                {token}
              </option>
            ))}
          </select>
        )}
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .email-rich-text-editor {
          font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: #374151;
        }
        .email-rich-text-editor p {
          margin: 0 0 1em;
        }
        .email-rich-text-editor h2 {
          margin: 0 0 0.75em;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1f71;
        }
        .email-rich-text-editor ul,
        .email-rich-text-editor ol {
          margin: 0 0 1em;
          padding-left: 1.5em;
        }
        .email-rich-text-editor li {
          margin: 0.25em 0;
        }
        .email-rich-text-editor p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
