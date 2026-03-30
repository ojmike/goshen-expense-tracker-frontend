import api from '@/services/api';

export interface CategoryTrend {
  categoryName: string;
  currentMonthAmount: number;
  previousMonthAmount: number;
  changePercent: number;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  leftover: number;
  savingsAmount: number;
  savingsRate: number;
}

export interface DebtSnapshot {
  year: number;
  month: number;
  totalRemainingDebt: number;
  totalPaid: number;
}

export interface AnalyticsData {
  categoryTrends: CategoryTrend[];
  monthlySummaries: MonthlySummary[];
  debtSnapshots: DebtSnapshot[];
}

export const analyticsService = {
  get: (year: number, month: number, months: number = 6) =>
    api.get<AnalyticsData>('/analytics', { params: { year, month, months } }).then((res) => res.data),
};
