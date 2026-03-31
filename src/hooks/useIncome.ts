import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeService, type IncomeSourceRequest } from '@/services/incomeService';

const INCOME_KEY = ['income-sources'] as const;

export function useIncomeOverview() {
  return useQuery({
    queryKey: INCOME_KEY,
    queryFn: incomeService.getOverview,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IncomeSourceRequest) => incomeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IncomeSourceRequest }) =>
      incomeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => incomeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INCOME_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
