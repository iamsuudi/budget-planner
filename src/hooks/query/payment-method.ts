import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addPaymentMethod,
  deletePaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
} from '#/lib/storage'

export const useGetPaymentMethods = () =>
  useQuery({
    queryKey: ['paymentMethods'],
    queryFn: getAllPaymentMethods,
  })

export const useGetPaymentMethodById = (id: string) =>
  useQuery({
    queryKey: ['paymentMethods', id],
    queryFn: () => getPaymentMethodById(id),
    enabled: !!id,
  })

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
    },
  })
}

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updatePaymentMethod>[1] }) =>
      updatePaymentMethod(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
    },
  })
}

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })
    },
  })
}