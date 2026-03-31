import { Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoanEmptyStateProps {
  onAdd: () => void;
}

export default function LoanEmptyState({ onAdd }: LoanEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <Landmark className="mb-4 size-10 text-muted-foreground" />
      <h3 className="text-base font-medium">No loans yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add your loans to track payments and watch your balance decrease over time.
      </p>
      <Button className="mt-4" onClick={onAdd}>Add Loan</Button>
    </div>
  );
}
