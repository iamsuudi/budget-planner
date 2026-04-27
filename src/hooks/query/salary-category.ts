import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addSalaryCategory,
  deleteSalaryCategory,
  getAllSalaryCategories,
  getSalaryCategoryById,
  updateSalaryCategory,
} from '#/lib/storage'

export const useGetSalaryCategories = () =>
  useQuery({
    queryKey: ['salaryCategories'],
    queryFn: getAllSalaryCategories,
  })

export const useGetSalaryCategoryById = (id: string) =>
  useQuery({
    queryKey: ['salaryCategories', id],
    queryFn: () => getSalaryCategoryById(id),
    enabled: !!id,
  })

export const useCreateSalaryCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addSalaryCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryCategories'] })
    },
  })
}

export const useUpdateSalaryCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Parameters<typeof updateSalaryCategory>[1]
    }) => updateSalaryCategory(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['salaryCategories'] })
      queryClient.invalidateQueries({ queryKey: ['salaryCategories', id] })
    },
  })
}

export const useDeleteSalaryCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSalaryCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaryCategories'] })
    },
  })
}