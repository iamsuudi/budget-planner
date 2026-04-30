import { getDB, generateId } from './db'
import type { Note } from '#/types/note'

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB()
  const all = await db.getAll('notes')
  return all
    .filter((n) => !n.deletedAt)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  const db = await getDB()
  return db.get('notes', id)
}

export async function addNote(
  title: string,
  content: string,
): Promise<Note> {
  const db = await getDB()
  const now = Date.now()
  const newNote: Note = {
    id: await generateId(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  }
  await db.put('notes', newNote)
  return newNote
}

export async function updateNote(
  id: string,
  updates: Partial<Omit<Note, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('notes', id)
  if (existing) {
    await db.put('notes', { ...existing, ...updates, updatedAt: Date.now() })
  }
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('notes', id)
}
