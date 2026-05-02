export interface TodoCategory {
  id: string
  name: string
  createdAt: number
  deletedAt?: number
}

const colorMap = new Map<string, string>()

export function getCategoryColor(name: string): string {
  if (!colorMap.has(name)) {
    colorMap.set(name, generateColor(name))
  }
  return colorMap.get(name)!
}

function generateColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }

  const h = Math.abs(hash % 360)
  const s = 65 + Math.abs((hash >> 8) % 20)
  const l = 55 + Math.abs((hash >> 16) % 15)

  return hslToHex(h, s, l)
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
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
