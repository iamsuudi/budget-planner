import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { NoteEditor } from '#/components/NoteEditor'
import { addNote } from '#/lib/storage'
import { GlassCard } from '#/components/GlassCard'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'

export const Route = createFileRoute('/note/add')({
  component: NoteAdd,
})

function NoteAdd() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editor, setEditor] = useState<any>(null)
  const navigate = useNavigate()

  const handleEditorRef = useCallback((ed: any) => setEditor(ed), [])
  const handleContentChange = useCallback((html: string) => setContent(html), [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    await addNote(title.trim(), content)
    navigate({ to: '/note' })
  }

  return (
    <div className="space-y-4 pb-20">
      <TopAppBar showBack backTo="/note" />

      <Page className="space-y-6">
        <h2 className="text-lg font-bold text-on-surface">Add Note</h2>

        <GlassCard className="p-4 space-y-4">
          <div>
            <label className="text-sm text-outline mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <p className="text-sm text-outline mb-2">Content</p>
            <div className="border border-outline/30 rounded-lg overflow-hidden bg-surface-container">
              <NoteEditor
                content=""
                onChange={handleContentChange}
                editorRef={handleEditorRef}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            Save Note
          </button>
        </GlassCard>
      </Page>
    </div>
  )
}
