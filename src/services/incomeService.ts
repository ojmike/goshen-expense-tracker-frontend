import api from '@/services/api';

export interface IncomeSource {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  nextPayDate: string;
  secondPayDay: number | null;
  monthlyEquivalent: number;
  createdAt: string;
}

export interface IncomeSourceRequest {
  name: string;
  amount: number;
  frequency: string;
  nextPayDate: string;
  secondPayDay?: number | null;
}

export interface IncomeOverview {
  totalMonthlyIncome: number;
  sourceCount: number;
  sources: IncomeSource[];
}

export const incomeService = {
  getOverview: () => api.get<IncomeOverview>('/income').then((res) => res.data),

  create: (data: IncomeSourceRequest) =>
    api.post<IncomeSource>('/income', data).then((res) => res.data),

  update: (id: number, data: IncomeSourceRequest) =>
    api.put<IncomeSource>(`/income/${id}`, data).then((res) => res.data),

  delete: (id: number) => api.delete(`/income/${id}`).then(() => undefined),
};
