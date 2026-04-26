export interface Month {
  id: string
  year: number
  number: number
  name: string
}

export interface MonthBudget {
  id: string
  monthId: string
  year: number
  number: number
  totalBudget: number
  categoryBudgets: Record<string, number>
  createdAt: number
  updatedAt: number
}