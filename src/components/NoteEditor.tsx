import type { ButtonHTMLAttributes, ReactNode } from 'react'
import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextAlign } from '@tiptap/extension-text-align'
import { FontSize } from '@tiptap/extension-text-style/font-size'
import { Icon } from '#/components/Icon'
import {
  ClipboardIcon,
  Highlighter,
  LinkIcon,
  List,
  ListIndentDecrease,
  ListIndentIncrease,
  ListOrdered,
  TextAlignJustify,
} from 'lucide-react'

interface ButtonWrapperProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isActive?: boolean
  className?: string
}

const ButtonWrapper: React.FC<ButtonWrapperProps> = ({
  children,
  isActive = false,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = 'p-1.5 rounded text-sm italic text-on-surface'

  return (
    <ButtonWrapper
      className={`${baseStyles} ${isActive && 'bg-primary/20 text-primary'} ${className}`}
      {...props}
    >
      {children}
    </ButtonWrapper>
  )
}
interface NoteEditorProps {
  content: string
  onChange: (html: string) => void
  editorRef: (editor: any) => void
}

export function NoteEditor({ content, onChange, editorRef }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none text-on-surface',
      },
    },
  })

  // Expose editor to parent
  editorRef(editor)

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run()
    }
  }

  const copyToClipboard = async () => {
    if (!editor) return
    const html = editor.getHTML()
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([editor.getText()], { type: 'text/plain' }),
        }),
      ])
      alert('Content copied to clipboard!')
    } catch {
      await navigator.clipboard.writeText(editor.getText())
      alert('Text copied to clipboard!')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 p-2 border-b border-outline/30 bg-surface-container-high">
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold"
        >
          B
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          I
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          U
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          S
        </ButtonWrapper>

        <div className="w-px h-6 bg-outline/30 mx-1" />

        <select
          onChange={(e) => {
            if (e.target.value) {
              editor?.chain().focus().setFontFamily(e.target.value).run()
            }
          }}
          className="text-xs px-1 py-1 rounded bg-surface-container-high border border-outline/30"
          defaultValue=""
          title="Font Family"
        >
          <option value="" disabled>
            Font
          </option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>

        <select
          onChange={(e) => {
            if (e.target.value) {
              editor?.chain().focus().setFontSize(e.target.value).run()
            }
          }}
          className="text-xs px-1 py-1 rounded bg-surface-container-high border border-outline/30"
          defaultValue=""
          title="Font Size"
        >
          <option value="" disabled>
            Size
          </option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>

        <div className="w-px h-6 bg-outline/30 mx-1" />

        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="size-4" />
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered className="size-4" />
        </ButtonWrapper>

        <div className="w-px h-6 bg-outline/30 mx-1" />

        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <Highlighter className="text-yellow-400 size-4" />
        </ButtonWrapper>

        <ButtonWrapper onClick={setLink} title="Add Link">
          <LinkIcon className="size-4" />
        </ButtonWrapper>

        <div className="w-px h-6 bg-outline/30 mx-1" />

        <ButtonWrapper
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          <ListIndentDecrease className="size-4" />
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          title="Align Center"
        >
          <TextAlignJustify className="size-4" />
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          <ListIndentIncrease className="size-4" />
        </ButtonWrapper>

        <div className="w-px h-6 bg-outline/30 mx-1" />

        <ButtonWrapper
          onClick={() => editor?.chain().focus().setColor('#ffffff').run()}
          className="p-1.5 rounded text-xs font-bold text-white"
          style={{ color: '#ffffff' }}
          title="White"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().setColor('#000000').run()}
          className="p-1.5 rounded text-xs font-bold text-black"
          style={{ color: '#000000' }}
          title="Black"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().setColor('#ff0000').run()}
          className="p-1.5 rounded text-xs font-bold text-red-500"
          style={{ color: '#ff0000' }}
          title="Red"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().setColor('#0000ff').run()}
          className="p-1.5 rounded text-xs font-bold text-blue-500"
          style={{ color: '#0000ff' }}
          title="Blue"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().setColor('#008000').run()}
          className="p-1.5 rounded text-xs font-bold text-green-500"
          style={{ color: '#008000' }}
          title="Green"
        >
          A
        </ButtonWrapper>

        <div className="w-px h-6 bg-outline/30 mx-1" />

        <ButtonWrapper
          onClick={copyToClipboard}
          className="p-1.5 rounded text-on-surface"
          title="Copy to Clipboard"
        >
          <ClipboardIcon className="size-4" />
        </ButtonWrapper>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
