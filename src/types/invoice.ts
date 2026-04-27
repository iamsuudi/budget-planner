export type InvoiceType = 'expense' | 'salary'

export interface Invoice {
  id: string
  amount: number
  date: string
  categoryId: string
  categoryName: string
  type: InvoiceType
  note?: string
  createdAt: number
  updatedAt: number
}