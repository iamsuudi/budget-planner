import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMonthBudget, setMonthBudget } from '#/lib/storage'

export const useGetMonthBudget = (year: number, month: number) =>
  useQuery({
    queryKey: ['budget', year, month],
    queryFn: () => getMonthBudget(year, month),
  })

export const useSetMonthBudget = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setMonthBudget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budget', variables.year, variables.number] })
    },
  })
}