import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Loader2, Plus, ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import LoanCard from '@/components/loans/LoanCard';
import LoanFormModal from '@/components/loans/LoanFormModal';
import DeleteLoanDialog from '@/components/loans/DeleteLoanDialog';
import PaymentFormModal from '@/components/loans/PaymentFormModal';
import PaymentHistory from '@/components/loans/PaymentHistory';
import DeletePaymentDialog from '@/components/loans/DeletePaymentDialog';
import LoanEmptyState from '@/components/loans/LoanEmptyState';
import { useLoans, useLoanDetail, useCreateLoan, useDeleteLoan, useRecordPayment, useDeletePayment, useCopyLoanPaymentsFromPreviousMonth } from '@/hooks/useLoans';
import type { Loan, LoanPayment } from '@/services/loanService';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function Loans() {
  const { data: loans = [], isLoading } = useLoans();
  const createLoan = useCreateLoan();
  const deleteLoan = useDeleteLoan();

  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const { data: loanDetail } = useLoanDetail(selectedLoanId);

  const recordPayment = useRecordPayment(selectedLoanId);
  const deletePayment = useDeletePayment(selectedLoanId);
  const copyPayments = useCopyLoanPaymentsFromPreviousMonth();

  const [loanFormOpen, setLoanFormOpen] = useState(false);
  const [deletingLoan, setDeletingLoan] = useState<Loan | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<LoanPayment | null>(null);
  const [error, setError] = useState('');

  const handleCreateLoan = async (data: { name: string; originalAmount: number }) => {
    await createLoan.mutateAsync(data);
  };

  const handleDeleteLoanConfirm = async () => {
    if (deletingLoan) {
      await deleteLoan.mutateAsync(deletingLoan.id);
      setDeletingLoan(null);
      if (selectedLoanId === deletingLoan.id) {
        setSelectedLoanId(null);
      }
    }
  };

  const handleRecordPayment = async (data: { amount: number; paymentDate: string; note?: string }) => {
    setError('');
    try {
      await recordPayment.mutateAsync(data);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to record payment');
      }
      throw err;
    }
  };

  const handleDeletePaymentConfirm = async () => {
    if (deletingPayment) {
      await deletePayment.mutateAsync(deletingPayment.id);
      setDeletingPayment(null);
    }
  };

  const hasLoans = loans.length > 0;

  // Detail view
  if (selectedLoanId !== null && loanDetail) {
    const paidPercent = loanDetail.originalAmount > 0
      ? Math.round((loanDetail.totalPaid / loanDetail.originalAmount) * 100)
      : 0;

    return (
      <Layout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-xs" onClick={() => setSelectedLoanId(null)} aria-label="Back to loans">
              <ArrowLeft />
            </Button>
            <h1 className="text-2xl font-semibold">{loanDetail.name}</h1>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Original Amount</p>
              <p className="text-lg font-semibold">{currencyFormat.format(loanDetail.originalAmount)}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Remaining Balance</p>
              <p className="text-lg font-semibold">{currencyFormat.format(loanDetail.remainingBalance)}</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-lg font-semibold">{currencyFormat.format(loanDetail.totalPaid)} ({paidPercent}%)</p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Payment History</h2>
            <Button onClick={() => { setError(''); setPaymentFormOpen(true); }}>
              <Plus className="size-4" />
              Record Payment
            </Button>
          </div>

          <PaymentHistory
            payments={loanDetail.payments}
            onDelete={(payment) => setDeletingPayment(payment)}
          />
        </div>

        <PaymentFormModal
          open={paymentFormOpen}
          onOpenChange={setPaymentFormOpen}
          loanName={loanDetail.name}
          remainingBalance={loanDetail.remainingBalance}
          onSubmit={handleRecordPayment}
        />

        <DeletePaymentDialog
          open={!!deletingPayment}
          onOpenChange={(open) => { if (!open) setDeletingPayment(null); }}
          onConfirm={handleDeletePaymentConfirm}
          isDeleting={deletePayment.isPending}
        />
      </Layout>
    );
  }

  // List view
  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Loans</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const now = new Date();
                copyPayments.mutate({ year: now.getFullYear(), month: now.getMonth() + 1 });
              }}
              disabled={copyPayments.isPending}
            >
              {copyPayments.isPending ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />}
              Copy Previous Payments
            </Button>
            <Button onClick={() => setLoanFormOpen(true)}>
              <Plus className="size-4" />
              Add Loan
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasLoans ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => (
              <LoanCard
                key={loan.id}
                loan={loan}
                onSelect={(l) => setSelectedLoanId(l.id)}
                onDelete={(l) => setDeletingLoan(l)}
              />
            ))}
          </div>
        ) : (
          <LoanEmptyState onAdd={() => setLoanFormOpen(true)} />
        )}
      </div>

      <LoanFormModal
        open={loanFormOpen}
        onOpenChange={setLoanFormOpen}
        onSubmit={handleCreateLoan}
      />

      <DeleteLoanDialog
        open={!!deletingLoan}
        onOpenChange={(open) => { if (!open) setDeletingLoan(null); }}
        loan={deletingLoan}
        onConfirm={handleDeleteLoanConfirm}
        isDeleting={deleteLoan.isPending}
      />
    </Layout>
  );
}
