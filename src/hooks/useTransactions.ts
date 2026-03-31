import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';

export function useBankTransactions(year: number, month: number) {
  return useQuery({
    queryKey: ['bank-transactions', year, month],
    queryFn: () => transactionService.getTransactions(year, month),
  });
}

export function useUpdateTransactionCategory(year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, categoryId }: { id: number; categoryId: number }) =>
      transactionService.updateCategory(id, categoryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bank-transactions', year, month] }),
  });
}

export function useMarkReviewed(year: number, month: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transactionService.markReviewed(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bank-transactions', year, month] }),
  });
}
