import { getDB, generateId } from './db'
import type { TodoCategory, TodoTask } from '#/types/todo'

export async function getAllTodoCategories(): Promise<TodoCategory[]> {
  const db = await getDB()
  const all = await db.getAll('todoCategories')
  return all
    .filter((c) => !c.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function getTodoCategoryById(
  id: string,
): Promise<TodoCategory | undefined> {
  const db = await getDB()
  return db.get('todoCategories', id)
}

export async function addTodoCategory(
  name: string,
): Promise<TodoCategory> {
  const db = await getDB()
  const newCategory: TodoCategory = {
    id: await generateId(),
    name,
    createdAt: Date.now(),
  }
  await db.put('todoCategories', newCategory)
  return newCategory
}

export async function updateTodoCategory(
  id: string,
  name: string,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('todoCategories', id)
  if (existing) {
    await db.put('todoCategories', { ...existing, name })
  }
}

export async function deleteTodoCategory(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('todoCategories', id)
  if (existing) {
    await db.put('todoCategories', { ...existing, deletedAt: Date.now() })
  }
}

export async function getTasksByCategoryAndDate(
  categoryId: string,
  date: string,
): Promise<TodoTask[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('todoTasks', 'by-category', categoryId)
  return all
    .filter((t) => t.date === date)
    .sort((a, b) => a.priority - b.priority)
}

export async function getTasksByDate(date: string): Promise<TodoTask[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('todoTasks', 'by-date', date)
  return all.sort((a, b) => a.priority - b.priority)
}

export async function addTodoTask(
  categoryId: string,
  name: string,
  date: string,
): Promise<TodoTask> {
  const db = await getDB()
  const existingTasks = await getTasksByCategoryAndDate(categoryId, date)
  const newTask: TodoTask = {
    id: await generateId(),
    categoryId,
    name,
    date,
    priority: existingTasks.length,
    done: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await db.put('todoTasks', newTask)
  return newTask
}

export async function updateTodoTask(
  id: string,
  updates: Partial<Omit<TodoTask, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('todoTasks', id)
  if (existing) {
    await db.put('todoTasks', { ...existing, ...updates, updatedAt: Date.now() })
  }
}

export async function deleteTodoTask(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('todoTasks', id)
}

export async function reorderTodoTasks(
  categoryId: string,
  date: string,
  taskIds: string[],
): Promise<void> {
  const db = await getDB()
  const updates = taskIds.map((id, index) => ({ id, priority: index }))
  for (const update of updates) {
    const existing = await db.get('todoTasks', update.id)
    if (existing && existing.categoryId === categoryId && existing.date === date) {
      await db.put('todoTasks', { ...existing, priority: update.priority, updatedAt: Date.now() })
    }
  }
}
