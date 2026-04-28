import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useEffect } from 'react'
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
import { useToast } from '#/lib/toast'

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
  const baseStyles =
    'p-1.5 rounded text-sm text-on-surface cursor-pointer hover:text-white hover:bg-primary/10 active:scale-95'

  return (
    <button
      className={`${baseStyles} ${isActive && 'bg-primary/20 text-primary'} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface NoteEditorProps {
  content: string
  onChange: (html: string) => void
  editorRef: (editor: any) => void
}

export function NoteEditor({ content, onChange, editorRef }: NoteEditorProps) {
  const { showToast } = useToast()
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
          'prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none text-on-surface resize-y overflow-auto',
        spellCheck: 'false',
      },
    },
  })

  useEffect(() => {
    if (editor) {
      editorRef(editor)
    }
  }, [editor, editorRef])

  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getHTML()
      if (currentContent !== content) {
        editor.commands.setContent(content, false)
      }
    }
  }, [content, editor])

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
      showToast('Content copied to clipboard!', 'success')
    } catch {
      await navigator.clipboard.writeText(editor.getText())
      showToast('Text copied to clipboard!', 'success')
    }
  }

  return (
    <div>
      <style>{`
        .editor-selection::selection,
        .editor-selection *::selection {
          background-color: rgba(var(--color-primary-rgb), 0.2);
        }
      `}</style>
      <div className="flex flex-wrap gap-1 p-2 border-b border-outline/30 bg-surface-container-high">
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className="font-bold"
          title="Bold"
        >
          B
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className="italic"
          title="Italic"
        >
          I
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className="underline"
          title="Underline"
        >
          U
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className="line-through"
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
          onClick={() => {
            const currentColor = editor?.getAttributes('textStyle').color
            if (currentColor === '#ffffff') {
              editor?.chain().focus().unsetColor().run()
            } else {
              editor?.chain().focus().setColor('#ffffff').run()
            }
          }}
          className="font-bold text-white"
          style={{ color: '#ffffff' }}
          title="White"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => {
            const currentColor = editor?.getAttributes('textStyle').color
            if (currentColor === '#000000') {
              editor?.chain().focus().unsetColor().run()
            } else {
              editor?.chain().focus().setColor('#000000').run()
            }
          }}
          className="font-bold text-black"
          style={{ color: '#000000' }}
          title="Black"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => {
            const currentColor = editor?.getAttributes('textStyle').color
            if (currentColor === '#ff0000') {
              editor?.chain().focus().unsetColor().run()
            } else {
              editor?.chain().focus().setColor('#ff0000').run()
            }
          }}
          className="font-bold text-red-500"
          style={{ color: '#ff0000' }}
          title="Red"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => {
            const currentColor = editor?.getAttributes('textStyle').color
            if (currentColor === '#0000ff') {
              editor?.chain().focus().unsetColor().run()
            } else {
              editor?.chain().focus().setColor('#0000ff').run()
            }
          }}
          className="font-bold text-blue-400"
          style={{ color: '#0000ff' }}
          title="Blue"
        >
          A
        </ButtonWrapper>
        <ButtonWrapper
          onClick={() => {
            const currentColor = editor?.getAttributes('textStyle').color
            if (currentColor === '#008000') {
              editor?.chain().focus().unsetColor().run()
            } else {
              editor?.chain().focus().setColor('#008000').run()
            }
          }}
          className="font-bold text-green-400"
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
      <div className="editor-selection">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
