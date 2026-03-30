import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plaidService } from '@/services/plaidService';

const ACCOUNTS_KEY = ['linked-accounts'];

export function useLinkedAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: plaidService.getAccounts,
  });
}

export function useExchangeToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicToken, institutionName }: { publicToken: string; institutionName?: string }) =>
      plaidService.exchangeToken(publicToken, institutionName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useUnlinkAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => plaidService.unlinkAccount(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useSyncTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => plaidService.syncTransactions(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['bank-transactions'] });
    },
  });
}
