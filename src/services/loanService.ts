import api from '@/services/api';

export interface Loan {
  id: number;
  name: string;
  originalAmount: number;
  remainingBalance: number;
  totalPaid: number;
  createdAt: string;
}

export interface LoanDetail extends Loan {
  payments: LoanPayment[];
}

export interface LoanPayment {
  id: number;
  amount: number;
  paymentDate: string;
  note: string | null;
  balanceAfterPayment: number;
  createdAt: string;
}

export interface LoanRequest {
  name: string;
  originalAmount: number;
}

export interface LoanPaymentRequest {
  amount: number;
  paymentDate: string;
  note?: string;
}

export const loanService = {
  getAll: () =>
    api.get<Loan[]>('/loans').then((res) => res.data),

  getDetail: (id: number) =>
    api.get<LoanDetail>(`/loans/${id}`).then((res) => res.data),

  create: (data: LoanRequest) =>
    api.post<Loan>('/loans', data).then((res) => res.data),

  delete: (id: number) => api.delete(`/loans/${id}`).then(() => undefined),

  recordPayment: (loanId: number, data: LoanPaymentRequest) =>
    api.post<LoanPayment>(`/loans/${loanId}/payments`, data).then((res) => res.data),

  deletePayment: (loanId: number, paymentId: number) =>
    api.delete(`/loans/${loanId}/payments/${paymentId}`).then(() => undefined),

  copyPaymentsFromPreviousMonth: (year: number, month: number) =>
    api.post<LoanPayment[]>('/loans/copy-payments', null, { params: { year, month } }).then((res) => res.data),
};
