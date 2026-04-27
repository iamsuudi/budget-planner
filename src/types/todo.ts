export interface TodoCategory {
  id: string
  name: string
  createdAt: number
  deletedAt?: number
}

export interface TodoTask {
  id: string
  categoryId: string
  name: string
  date: string
  priority: number
  done: boolean
  createdAt: number
  updatedAt: number
}
