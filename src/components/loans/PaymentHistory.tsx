import { format, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { LoanPayment } from '@/services/loanService';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface PaymentHistoryProps {
  payments: LoanPayment[];
  onDelete: (payment: LoanPayment) => void;
}

export default function PaymentHistory({ payments, onDelete }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No payments recorded yet.
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currencyFormat.format(payment.amount)}</span>
                  {payment.note && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {payment.note}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(parseISO(payment.paymentDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Balance after</p>
                  <p className="text-sm font-medium">{currencyFormat.format(payment.balanceAfterPayment)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDelete(payment)}
                  aria-label="Delete payment"
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
