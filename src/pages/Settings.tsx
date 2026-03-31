import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import IncomeSummaryCard from '@/components/income/IncomeSummaryCard';
import IncomeCard from '@/components/income/IncomeCard';
import IncomeFormModal from '@/components/income/IncomeFormModal';
import DeleteIncomeDialog from '@/components/income/DeleteIncomeDialog';
import IncomeEmptyState from '@/components/income/IncomeEmptyState';
import CategoryList from '@/components/categories/CategoryList';
import { useIncomeOverview, useCreateIncome, useUpdateIncome, useDeleteIncome } from '@/hooks/useIncome';
import type { IncomeSource } from '@/services/incomeService';

export default function Settings() {
  const { data: overview, isLoading } = useIncomeOverview();
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [deletingSource, setDeletingSource] = useState<IncomeSource | null>(null);

  const handleAdd = () => {
    setEditingSource(null);
    setFormOpen(true);
  };

  const handleEdit = (source: IncomeSource) => {
    setEditingSource(source);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: { name: string; amount: number; frequency: string; nextPayDate: string }) => {
    if (editingSource) {
      await updateIncome.mutateAsync({ id: editingSource.id, data });
    } else {
      await createIncome.mutateAsync(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingSource) {
      await deleteIncome.mutateAsync(deletingSource.id);
      setDeletingSource(null);
    }
  };

  const hasSources = overview && overview.sources.length > 0;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Income Sources</h2>
              <p className="text-sm text-muted-foreground">Configure your income to calculate monthly estimates.</p>
            </div>
            {hasSources && <Button onClick={handleAdd}>Add Income Source</Button>}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasSources ? (
            <div className="space-y-4">
              <IncomeSummaryCard
                totalMonthlyIncome={overview.totalMonthlyIncome}
                sourceCount={overview.sourceCount}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {overview.sources.map((source) => (
                  <IncomeCard
                    key={source.id}
                    source={source}
                    onEdit={handleEdit}
                    onDelete={setDeletingSource}
                  />
                ))}
              </div>
            </div>
          ) : (
            <IncomeEmptyState onAdd={handleAdd} />
          )}
        </section>

        <section className="space-y-4">
          <CategoryList />
        </section>
      </div>

      <IncomeFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        source={editingSource}
        onSubmit={handleFormSubmit}
      />

      <DeleteIncomeDialog
        open={!!deletingSource}
        onOpenChange={(open) => { if (!open) setDeletingSource(null); }}
        source={deletingSource}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteIncome.isPending}
      />
    </Layout>
  );
}
