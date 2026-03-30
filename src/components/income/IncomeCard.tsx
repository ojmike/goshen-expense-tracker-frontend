import { format, parseISO } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import type { IncomeSource } from '@/services/incomeService';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const frequencyLabels: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Biweekly',
  MONTHLY: 'Monthly',
};

interface IncomeCardProps {
  source: IncomeSource;
  onEdit: (source: IncomeSource) => void;
  onDelete: (source: IncomeSource) => void;
}

export default function IncomeCard({ source, onEdit, onDelete }: IncomeCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{source.name}</CardTitle>
        <CardAction>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-xs" onClick={() => onEdit(source)} aria-label={`Edit ${source.name}`}>
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onDelete(source)} aria-label={`Delete ${source.name}`}>
              <Trash2 />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-lg font-semibold">{currencyFormat.format(source.amount)}</p>
        <p className="text-sm text-muted-foreground">{frequencyLabels[source.frequency] ?? source.frequency}</p>
        {source.frequency !== 'MONTHLY' && (
          <p className="text-sm text-muted-foreground">
            {currencyFormat.format(source.monthlyEquivalent)}/mo equivalent
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Next pay: {format(parseISO(source.nextPayDate), 'MMM d, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
}
