export interface TodoCategory {
  id: string
  name: string
  createdAt: number
  deletedAt?: number
}

export const CATEGORY_COLORS = [
  '#d0bcff',
  '#4cd7f6',
  '#4edea3',
  '#f6a04c',
  '#f67c4c',
  '#e8526a',
  '#a36ff6',
  '#52d6f6',
  '#f6d852',
  '#a8e6a3',
] as const

const colorMap = new Map<string, string>()

export function getCategoryColor(name: string): string {
  if (!colorMap.has(name)) {
    const idx = Math.abs(hashCode(name)) % CATEGORY_COLORS.length
    colorMap.set(name, CATEGORY_COLORS[idx])
  }
  return colorMap.get(name)!
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
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
