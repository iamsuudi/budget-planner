import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getAllNotes, deleteNote } from '#/lib/storage'
import { GlassCard } from '#/components/GlassCard'
import { Icon } from '#/components/Icon'
import type { Note } from '#/types/note'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'

export const Route = createFileRoute('/note/')({
  component: NoteIndex,
})

function NoteIndex() {
  const [notes, setNotes] = useState<Note[]>([])

  const loadData = async () => {
    const allNotes = await getAllNotes()
    setNotes(allNotes)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    await deleteNote(id)
    loadData()
  }

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page
        className="pb-48"
        title="Notes"
        description="Create, edit and delete your notes here."
      >
        <div className="space-y-2">
          {notes.map((note) => (
            <GlassCard key={note.id} className="p-4">
              <Link
                to="/note/view/$id"
                params={{ id: note.id }}
                className="flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {note.title}
                  </p>
                  <p className="text-xs text-outline">
                    {new Date(note.updatedAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(note.id)
                  }}
                  className="p-1 hover:bg-error-container rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Icon name="close" size={16} />
                </button>
              </Link>
            </GlassCard>
          ))}
        </div>

        {notes.length === 0 && (
          <p className="text-center text-outline py-8 text-sm">
            No notes yet. Create your first note!
          </p>
        )}

        <div className="fixed bottom-24 right-4">
          <Link
            to="/note/add"
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Icon name="add" className="text-on-primary" />
          </Link>
        </div>
      </Page>
    </div>
  )
}
