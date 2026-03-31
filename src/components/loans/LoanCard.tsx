import { Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import type { Loan } from '@/services/loanService';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface LoanCardProps {
  loan: Loan;
  onSelect: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
}

export default function LoanCard({ loan, onSelect, onDelete }: LoanCardProps) {
  const paidPercent = loan.originalAmount > 0
    ? Math.min(100, Math.round((loan.totalPaid / loan.originalAmount) * 100))
    : 0;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{loan.name}</CardTitle>
        <CardAction>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(loan)}
              aria-label={`Delete ${loan.name}`}
            >
              <Trash2 />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Remaining Balance</p>
          <p className="text-lg font-semibold">{currencyFormat.format(loan.remainingBalance)}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${paidPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{currencyFormat.format(loan.totalPaid)} paid</span>
          <span>{paidPercent}% of {currencyFormat.format(loan.originalAmount)}</span>
        </div>
        <Button variant="ghost" size="sm" className="w-full" onClick={() => onSelect(loan)}>
          View Payments
          <ChevronRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
