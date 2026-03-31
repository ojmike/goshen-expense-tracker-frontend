import { useState } from 'react';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CategoryFormModal from '@/components/categories/CategoryFormModal';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import type { Category } from '@/services/categoryService';

export default function CategoryList() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const handleAdd = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: { name: string }) => {
    setError('');
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data });
      } else {
        await createCategory.mutateAsync(data);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Something went wrong. Please try again.');
      }
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingCategory) {
      setError('');
      try {
        await deleteCategory.mutateAsync(deletingCategory.id);
        setDeletingCategory(null);
      } catch (err) {
        if (isAxiosError(err) && err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to delete category.');
        }
        setDeletingCategory(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Expense Categories</h2>
          <p className="text-sm text-muted-foreground">Organize your expenses into categories.</p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border border-border">
        {categories && categories.length > 0 ? (
          <ul className="divide-y divide-border">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{category.name}</span>
                  {category.isDefault && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Default</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(category)} aria-label={`Rename ${category.name}`}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setDeletingCategory(category)} aria-label={`Delete ${category.name}`}>
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>

      <CategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        onSubmit={handleFormSubmit}
      />

      <DeleteCategoryDialog
        open={!!deletingCategory}
        onOpenChange={(open) => { if (!open) setDeletingCategory(null); }}
        category={deletingCategory}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteCategory.isPending}
      />
    </div>
  );
}
