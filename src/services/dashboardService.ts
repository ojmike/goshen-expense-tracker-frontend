import api from '@/services/api';

export interface IncomeSourceBreakdown {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  nextPayDate: string;
  secondPayDay: number | null;
  monthlyEquivalent: number;
}

export interface CategoryBreakdown {
  categoryName: string;
  totalAmount: number;
  count: number;
}

export interface LoanBreakdown {
  id: number;
  name: string;
  originalAmount: number;
  remainingBalance: number;
  totalPaid: number;
}

export interface DashboardOverview {
  year: number;
  month: number;
  totalMonthlyIncome: number;
  incomeSourceCount: number;
  incomeSources: IncomeSourceBreakdown[];
  totalMonthlyExpenses: number;
  expenseCount: number;
  expensesByCategory: CategoryBreakdown[];
  carryOver: number;
  leftover: number;
  totalRemainingDebt: number;
  totalDebtPaid: number;
  loanCount: number;
  loans: LoanBreakdown[];
}

export interface CashFlowEvent {
  date: string;
  description: string;
  type: 'INCOME' | 'EXPENSE' | 'LOAN_PAYMENT';
  amount: number;
  runningBalance: number;
}

export interface CashFlowResponse {
  year: number;
  month: number;
  events: CashFlowEvent[];
  lowestBalance: number;
  lowestBalanceDate: string;
  willGoNegative: boolean;
}

export const dashboardService = {
  getOverview: (year: number, month: number) =>
    api.get<DashboardOverview>('/dashboard', { params: { year, month } }).then((res) => res.data),

  getCashFlow: (year: number, month: number) =>
    api.get<CashFlowResponse>('/dashboard/cashflow', { params: { year, month } }).then((res) => res.data),
};
