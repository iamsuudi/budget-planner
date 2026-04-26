import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addWallet,
  deleteWallet,
  getAllWallets,
  getWalletById,
  updateWallet,
} from '#/lib/storage'

export const useGetWallets = () =>
  useQuery({
    queryKey: ['wallets'],
    queryFn: getAllWallets,
  })

export const useGetWalletById = (id: string) =>
  useQuery({
    queryKey: ['wallets', id],
    queryFn: () => getWalletById(id),
    enabled: !!id,
  })

export const useCreateWallet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}

export const useUpdateWallet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateWallet>[1] }) =>
      updateWallet(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallets', id] })
    },
  })
}

export const useDeleteWallet = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}