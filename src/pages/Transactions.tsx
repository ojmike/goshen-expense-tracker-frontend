import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Loader2, Check, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useBankTransactions, useUpdateTransactionCategory, useMarkReviewed } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function Transactions() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: transactions, isLoading } = useBankTransactions(year, month);
  const { data: categories = [] } = useCategories();
  const updateCategory = useUpdateTransactionCategory(year, month);
  const markReviewed = useMarkReviewed(year, month);

  const handleCategoryChange = async (txnId: number, categoryId: number) => {
    await updateCategory.mutateAsync({ id: txnId, categoryId });
    setEditingId(null);
  };

  const handleApprove = async (id: number) => {
    await markReviewed.mutateAsync(id);
  };

  const unreviewedCount = transactions?.filter((t) => !t.reviewed).length ?? 0;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          {unreviewedCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              {unreviewedCount} to review
            </span>
          )}
        </div>

        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {transactions.map((txn) => (
                  <div key={txn.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{txn.name}</span>
                          {!txn.reviewed && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                              Unreviewed
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{format(parseISO(txn.transactionDate), 'MMM d, yyyy')}</span>
                          {txn.plaidCategory && <span>• {txn.plaidCategory}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{currencyFormat.format(txn.amount)}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {editingId === txn.id ? (
                        <select
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                          value={txn.categoryId ?? ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val) handleCategoryChange(txn.id, val);
                          }}
                          autoFocus
                          onBlur={() => setEditingId(null)}
                        >
                          <option value="">Select category...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingId(txn.id)}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {txn.categoryName ?? 'Uncategorized'}
                        </button>
                      )}
                      {!txn.reviewed && txn.categoryId && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleApprove(txn.id)}
                          aria-label="Approve categorization"
                        >
                          <Check className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <ArrowRightLeft className="mb-4 size-10 text-muted-foreground" />
            <h3 className="text-base font-medium">No transactions this month</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Link a bank account and sync transactions to see them here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
