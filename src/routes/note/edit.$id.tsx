import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { NoteEditor } from '#/components/NoteEditor'
import { getNoteById, updateNote, deleteNote } from '#/lib/storage'
import { GlassCard } from '#/components/GlassCard'
import type { Note } from '#/types/note'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/note/edit/$id')({
  component: NoteEdit,
})

function NoteEdit() {
  const { id } = Route.useParams()
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editor, setEditor] = useState<any>(null)
  const navigate = useNavigate()

  const handleEditorRef = useCallback((ed: any) => setEditor(ed), [])
  const handleContentChange = useCallback((html: string) => setContent(html), [])

  useEffect(() => {
    const loadNote = async () => {
      const n = await getNoteById(id)
      if (n) {
        setNote(n)
        setTitle(n.title)
        setContent(n.content)
      }
    }
    loadNote()
  }, [id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    await updateNote(id, { title: title.trim(), content })
    navigate({ to: '/note' })
  }

  const handleDelete = async () => {
    await deleteNote(id)
    navigate({ to: '/note' })
  }

  if (!note) return <div>Loading...</div>

  return (
    <div className="space-y-4 pb-20">
      <TopAppBar showBack backTo="/note" />

      <Page className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Edit Note</h2>
          <button
            onClick={handleDelete}
            className="p-2 bg-error-container rounded-lg text-sm text-on-error-container cursor-pointer"
          >
            <Icon name="delete" size={16} />
          </button>
        </div>

        <GlassCard className="p-4 space-y-4">
          <div>
            <label className="text-sm text-outline mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <p className="text-sm text-outline mb-2">Content</p>
            <div className="border border-outline/30 rounded-lg overflow-hidden bg-surface-container">
              <NoteEditor
                content={content}
                onChange={handleContentChange}
                editorRef={handleEditorRef}
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={!title.trim() || !content.trim()}
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            Update Note
          </button>
        </GlassCard>
      </Page>
    </div>
  )
}
