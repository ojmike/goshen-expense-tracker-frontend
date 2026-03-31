import api from '@/services/api';

export interface LinkedAccount {
  id: number;
  institutionName: string | null;
  accountName: string | null;
  accountMask: string | null;
  createdAt: string;
}

export const plaidService = {
  createLinkToken: () =>
    api.post<{ linkToken: string }>('/plaid/link-token').then((res) => res.data.linkToken),

  exchangeToken: (publicToken: string, institutionName?: string) =>
    api.post<LinkedAccount>('/plaid/exchange-token', { publicToken, institutionName }).then((res) => res.data),

  getAccounts: () =>
    api.get<LinkedAccount[]>('/plaid/accounts').then((res) => res.data),

  unlinkAccount: (id: number) =>
    api.delete(`/plaid/accounts/${id}`).then((res) => res.data),

  syncTransactions: (id: number) =>
    api.post<{ synced: number }>(`/plaid/accounts/${id}/sync`).then((res) => res.data),
};
