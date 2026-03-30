import api from '@/services/api';

export interface DashboardOverview {
  year: number;
  month: number;
  totalMonthlyIncome: number;
  incomeSourceCount: number;
  totalMonthlyExpenses: number;
  expenseCount: number;
  leftover: number;
  totalRemainingDebt: number;
  totalDebtPaid: number;
  loanCount: number;
}

export const dashboardService = {
  getOverview: (year: number, month: number) =>
    api.get<DashboardOverview>('/dashboard', { params: { year, month } }).then((res) => res.data),
};
