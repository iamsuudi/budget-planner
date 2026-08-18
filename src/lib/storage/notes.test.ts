import { beforeEach, describe, expect, it } from 'vitest'
import {
  addNote,
  clearAllData,
  deleteNote,
  getAllNotes,
  getNoteById,
  updateNote,
} from '#/lib/storage'

describe('notes', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('adds a note with timestamps', async () => {
    const note = await addNote('Title', 'Content')
    expect(note.title).toBe('Title')
    expect(note.content).toBe('Content')
    expect(note.createdAt).toBeGreaterThan(0)
    expect(note.updatedAt).toBeGreaterThan(0)
  })

  it('returns notes sorted by most recently updated first', async () => {
    const first = await addNote('First', 'a')
    await addNote('Second', 'b')
    await updateNote(first.id, { title: 'First (edited)' })

    const all = await getAllNotes()
    expect(all).toHaveLength(2)
    expect(all[0].id).toBe(first.id)
    expect(all[0].title).toBe('First (edited)')
  })

  it('updates content', async () => {
    const note = await addNote('Title', 'Old')
    await updateNote(note.id, { content: 'New' })
    const updated = await getNoteById(note.id)
    expect(updated?.content).toBe('New')
  })

  it('hard-deletes a note', async () => {
    const note = await addNote('Title', 'Content')
    await deleteNote(note.id)
    await expect(getNoteById(note.id)).resolves.toBeUndefined()
    expect(await getAllNotes()).toHaveLength(0)
  })
})