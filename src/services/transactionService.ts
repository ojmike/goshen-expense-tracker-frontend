import api from '@/services/api';

export interface BankTransaction {
  id: number;
  name: string;
  amount: number;
  transactionDate: string;
  plaidCategory: string | null;
  categoryId: number | null;
  categoryName: string | null;
  reviewed: boolean;
  createdAt: string;
}

export const transactionService = {
  getTransactions: (year: number, month: number) =>
    api.get<BankTransaction[]>('/transactions', { params: { year, month } }).then((res) => res.data),

  updateCategory: (id: number, categoryId: number) =>
    api.put<BankTransaction>(`/transactions/${id}/category`, { categoryId }).then((res) => res.data),

  markReviewed: (id: number) =>
    api.put<BankTransaction>(`/transactions/${id}/reviewed`).then((res) => res.data),
};
