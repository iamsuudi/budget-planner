import { beforeEach, describe, expect, it } from 'vitest'
import {
  addTodoCategory,
  addTodoTask,
  clearAllData,
  deleteTodoCategory,
  getAllTodoCategories,
  getTasksByCategoryAndDate,
  getTasksByDate,
  reorderTodoTasks,
  updateTodoTask,
} from '#/lib/storage'

describe('todos', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('adds and lists todo categories', async () => {
    const category = await addTodoCategory('Work')
    expect(category.name).toBe('Work')
    expect(category.id).toBeTruthy()

    const all = await getAllTodoCategories()
    expect(all).toHaveLength(1)
  })

  it('soft-deletes todo categories', async () => {
    const category = await addTodoCategory('Work')
    await deleteTodoCategory(category.id)

    const all = await getAllTodoCategories()
    expect(all).toHaveLength(0)
  })

  it('assigns incrementing priorities within the same date', async () => {
    await addTodoTask('cat-1', 'Task A', '2024-05-15')
    await addTodoTask('cat-1', 'Task B', '2024-05-15')
    await addTodoTask('cat-2', 'Task C', '2024-05-16')

    const tasks = await getTasksByDate('2024-05-15')
    expect(tasks).toHaveLength(2)
    expect(tasks.map((t) => t.priority).sort((a, b) => a - b)).toEqual([0, 1])
    expect(tasks[0].name).toBe('Task A')
  })

  it('returns tasks for a category and date only', async () => {
    await addTodoTask('cat-1', 'Today', '2024-05-15')
    await addTodoTask('cat-1', 'Tomorrow', '2024-05-16')
    await addTodoTask('cat-2', 'Other', '2024-05-15')

    const tasks = await getTasksByCategoryAndDate('cat-1', '2024-05-15')
    expect(tasks).toHaveLength(1)
    expect(tasks[0].name).toBe('Today')
  })

  it('updates a task', async () => {
    const task = await addTodoTask('cat-1', 'Task', '2024-05-15')
    await updateTodoTask(task.id, { done: true })
    const [updated] = await getTasksByDate('2024-05-15')
    expect(updated.done).toBe(true)
  })

  it('reorders tasks within a date', async () => {
    const a = await addTodoTask('cat-1', 'A', '2024-05-15')
    const b = await addTodoTask('cat-1', 'B', '2024-05-15')

    await reorderTodoTasks('2024-05-15', [b.id, a.id])

    const tasks = await getTasksByDate('2024-05-15')
    expect(tasks.map((t) => t.name)).toEqual(['B', 'A'])
    expect(tasks[0].priority).toBe(0)
    expect(tasks[1].priority).toBe(1)
  })
})