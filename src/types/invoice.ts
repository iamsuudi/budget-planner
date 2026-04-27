export interface Invoice {
  id: string
  amount: number
  date: string
  categoryId: string
  categoryName: string
  note?: string
  createdAt: number
  updatedAt: number
}