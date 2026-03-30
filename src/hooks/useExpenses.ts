import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, type ExpenseRequest } from '@/services/expenseService';

export function useMonthlyExpenses(year: number, month: number) {
  return useQuery({
    queryKey: ['expenses', year, month],
    queryFn: () => expenseService.getMonthly(year, month),
  });
}

export function useCreateExpense(year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExpenseRequest) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', year, month] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateExpense(year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExpenseRequest }) =>
      expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', year, month] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteExpense(year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', year, month] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
