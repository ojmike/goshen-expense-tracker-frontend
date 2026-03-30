import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Loader2, Pencil, Trash2, Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import MonthSelector from '@/components/expenses/MonthSelector';
import ExpenseFormModal from '@/components/expenses/ExpenseFormModal';
import DeleteExpenseDialog from '@/components/expenses/DeleteExpenseDialog';
import { useMonthlyExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import type { Expense } from '@/services/expenseService';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const typeLabels: Record<string, string> = {
  RECURRING: 'Recurring',
  ONE_TIME: 'One-time',
};

export default function Expenses() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: overview, isLoading } = useMonthlyExpenses(year, month);
  const { data: categories = [] } = useCategories();
  const createExpense = useCreateExpense(year, month);
  const updateExpense = useUpdateExpense(year, month);
  const deleteExpense = useDeleteExpense(year, month);

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const handleAdd = () => {
    setEditingExpense(null);
    setFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: { name: string; amount: number; categoryId: number; expenseType: string; expenseDate: string }) => {
    if (editingExpense) {
      await updateExpense.mutateAsync({ id: editingExpense.id, data });
    } else {
      await createExpense.mutateAsync(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingExpense) {
      await deleteExpense.mutateAsync(deletingExpense.id);
      setDeletingExpense(null);
    }
  };

  const hasExpenses = overview && overview.expenses.length > 0;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            Add Expense
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
          {hasExpenses && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total this month</p>
              <p className="text-xl font-semibold">{currencyFormat.format(overview.totalAmount)}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasExpenses ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {overview.expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{expense.name}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {expense.categoryName}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {typeLabels[expense.expenseType] ?? expense.expenseType}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {format(parseISO(expense.expenseDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{currencyFormat.format(expense.amount)}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(expense)} aria-label={`Edit ${expense.name}`}>
                          <Pencil />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => setDeletingExpense(expense)} aria-label={`Delete ${expense.name}`}>
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <Receipt className="mb-4 size-10 text-muted-foreground" />
            <h3 className="text-base font-medium">No expenses this month</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Add your first expense to start tracking where your money goes.
            </p>
            <Button className="mt-4" onClick={handleAdd}>Add Expense</Button>
          </div>
        )}
      </div>

      <ExpenseFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editingExpense}
        categories={categories}
        onSubmit={handleFormSubmit}
      />

      <DeleteExpenseDialog
        open={!!deletingExpense}
        onOpenChange={(open) => { if (!open) setDeletingExpense(null); }}
        expense={deletingExpense}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteExpense.isPending}
      />
    </Layout>
  );
}
