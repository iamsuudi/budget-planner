import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addInvoice,
  deleteInvoice,
  getInvoicesByMonth,
  getInvoiceById,
  updateInvoice,
} from '#/lib/storage'

export const useGetInvoicesByMonth = (year: number, month: number) =>
  useQuery({
    queryKey: ['invoices', year, month],
    queryFn: () => getInvoicesByMonth(year, month),
  })

export const useGetInvoiceById = (id: string) =>
  useQuery({
    queryKey: ['invoices', id],
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  })

export const useCreateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateInvoice>[1] }) =>
      updateInvoice(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', id] })
    },
  })
}

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}