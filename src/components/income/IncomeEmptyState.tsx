import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncomeEmptyStateProps {
  onAdd: () => void;
}

export default function IncomeEmptyState({ onAdd }: IncomeEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <Wallet className="mb-4 size-10 text-muted-foreground" />
      <h3 className="text-base font-medium">No income sources yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add your income sources to see how much you earn each month.
      </p>
      <Button className="mt-4" onClick={onAdd}>Add Income Source</Button>
    </div>
  );
}
