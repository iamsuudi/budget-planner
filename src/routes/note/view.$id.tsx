import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getNoteById } from '#/lib/storage'
import type { Note } from '#/types/note'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/note/view/$id')({
  component: NoteView,
})

function NoteView() {
  const { id } = Route.useParams()
  const [note, setNote] = useState<Note | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadNote = async () => {
      const n = await getNoteById(id)
      if (n) setNote(n)
    }
    loadNote()
  }, [id])

  if (!note) return <div className="p-4 text-on-surface">Loading...</div>

  return (
    <div className="space-y-4 pb-20">
      <TopAppBar showBack backTo="/note" />

      <Page title={note.title} description="">
        <button
          onClick={() => navigate({ to: '/note/edit/$id', params: { id } })}
          className="absolute top-24 right-4 px-3 py-2 bg-primary-container rounded-lg text-on-primary-container cursor-pointer hover:bg-primary-container/80"
        >
          <Icon name="edit" size={16} />
        </button>

        <div className="border border-outline/30 rounded-lg overflow-hidden bg-surface-container">
          <div
            className="prose prose-sm max-w-none p-4 min-h-75 text-on-surface overflow-auto
            [&::selection]:bg-[rgba(var(--color-primary-rgb),0.2)]
            [&_a]:text-[#3b82f6] [&_a]:underline [&_a]:underline-offset-2 [&_a]:cursor-pointer
            [&_a:hover]:text-[#2563eb] [&_a:hover]:bg-[rgba(59,130,246,0.1)]"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>

        <p className="text-xs text-outline text-right">
          {note.updatedAt !== note.createdAt && (
            <>
              {' '}
              · Updated:{' '}
              {new Date(note.updatedAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </>
          )}
          <br />
          Created:{' '}
          {new Date(note.createdAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </Page>
    </div>
  )
}
