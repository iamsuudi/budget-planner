export interface Invoice {
  id: string
  amount: number
  date: string
  categoryId: string
  categoryName: string
  paymentMethodId: string
  paymentMethodName: string
  note?: string
  createdAt: number
  updatedAt: number
}