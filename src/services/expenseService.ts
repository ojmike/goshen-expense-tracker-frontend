import api from '@/services/api';

export interface Expense {
  id: number;
  name: string;
  amount: number;
  expenseType: string;
  expenseDate: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

export interface ExpenseRequest {
  name: string;
  amount: number;
  categoryId: number;
  expenseType: string;
  expenseDate: string;
}

export interface MonthlyExpenseOverview {
  year: number;
  month: number;
  totalAmount: number;
  expenseCount: number;
  expenses: Expense[];
}

export const expenseService = {
  getMonthly: (year: number, month: number) =>
    api.get<MonthlyExpenseOverview>('/expenses', { params: { year, month } }).then((res) => res.data),

  create: (data: ExpenseRequest) =>
    api.post<Expense>('/expenses', data).then((res) => res.data),

  update: (id: number, data: ExpenseRequest) =>
    api.put<Expense>(`/expenses/${id}`, data).then((res) => res.data),

  delete: (id: number) => api.delete(`/expenses/${id}`),
};
