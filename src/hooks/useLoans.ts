import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService, type LoanRequest, type LoanPaymentRequest } from '@/services/loanService';

const LOANS_KEY = ['loans'];

export function useLoans() {
  return useQuery({
    queryKey: LOANS_KEY,
    queryFn: loanService.getAll,
  });
}

export function useLoanDetail(id: number | null) {
  return useQuery({
    queryKey: ['loans', id],
    queryFn: () => loanService.getDetail(id!),
    enabled: id !== null,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoanRequest) => loanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => loanService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRecordPayment(loanId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoanPaymentRequest) => loanService.recordPayment(loanId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_KEY });
      queryClient.invalidateQueries({ queryKey: ['loans', loanId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePayment(loanId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: number) => loanService.deletePayment(loanId!, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_KEY });
      queryClient.invalidateQueries({ queryKey: ['loans', loanId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCopyLoanPaymentsFromPreviousMonth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      loanService.copyPaymentsFromPreviousMonth(year, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOANS_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
