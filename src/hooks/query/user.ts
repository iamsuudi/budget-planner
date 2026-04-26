import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUser, saveUser, getCurrency, setCurrency } from '#/lib/storage'

export const useGetUser = () =>
  useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  })

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export const useGetCurrency = () =>
  useQuery({
    queryKey: ['currency'],
    queryFn: getCurrency,
  })

export const useSetCurrency = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currency'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}