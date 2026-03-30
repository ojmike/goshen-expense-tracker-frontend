import { Card, CardContent } from '@/components/ui/card';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface IncomeSummaryCardProps {
  totalMonthlyIncome: number;
  sourceCount: number;
}

export default function IncomeSummaryCard({ totalMonthlyIncome, sourceCount }: IncomeSummaryCardProps) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">Estimated Monthly Income</p>
        <p className="text-[28px] font-semibold tracking-tight" aria-live="polite">
          {currencyFormat.format(totalMonthlyIncome)}
        </p>
        <p className="text-sm text-muted-foreground">
          {sourceCount} income {sourceCount === 1 ? 'source' : 'sources'}
        </p>
      </CardContent>
    </Card>
  );
}
