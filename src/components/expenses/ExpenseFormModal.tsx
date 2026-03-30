import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { Expense } from '@/services/expenseService';
import type { Category } from '@/services/categoryService';

const schema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  expenseType: z.enum(['RECURRING', 'ONE_TIME'], { message: 'Select a type' }),
  expenseDate: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof schema>;

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  categories: Category[];
  onSubmit: (data: { name: string; amount: number; categoryId: number; expenseType: string; expenseDate: string }) => Promise<void>;
}

export default function ExpenseFormModal({ open, onOpenChange, expense, categories, onSubmit }: ExpenseFormModalProps) {
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          categoryId: String(expense.categoryId),
          amount: expense.amount,
          expenseType: expense.expenseType as 'RECURRING' | 'ONE_TIME',
          expenseDate: expense.expenseDate,
        });
      } else {
        reset({ categoryId: '', amount: undefined, expenseType: 'ONE_TIME', expenseDate: '' });
      }
    }
  }, [open, expense, reset]);

  const handleFormSubmit = async (data: FormData) => {
    const category = categories.find((c) => String(c.id) === data.categoryId);
    await onSubmit({
      name: category?.name ?? '',
      amount: data.amount,
      categoryId: Number(data.categoryId),
      expenseType: data.expenseType,
      expenseDate: data.expenseDate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this expense.' : 'Enter the details for your expense.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenseAmount">Amount ($)</Label>
            <Input id="expenseAmount" type="number" step="0.01" min="0.01" placeholder="0.00" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Controller
              name="expenseType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECURRING">Recurring (Monthly)</SelectItem>
                    <SelectItem value="ONE_TIME">One-time</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.expenseType && <p className="text-sm text-destructive">{errors.expenseType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenseDate">Date</Label>
            <Input id="expenseDate" type="date" {...register('expenseDate')} />
            {errors.expenseDate && <p className="text-sm text-destructive">{errors.expenseDate.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
