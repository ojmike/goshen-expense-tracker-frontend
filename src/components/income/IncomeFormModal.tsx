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
import type { IncomeSource } from '@/services/incomeService';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  amount: z.number().positive('Amount must be greater than 0'),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY'], { message: 'Select a frequency' }),
  nextPayDate: z.string().min(1, 'Next pay date is required'),
});

type FormData = z.infer<typeof schema>;

interface IncomeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: IncomeSource | null;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function IncomeFormModal({ open, onOpenChange, source, onSubmit }: IncomeFormModalProps) {
  const isEditing = !!source;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      amount: undefined,
      frequency: 'MONTHLY',
      nextPayDate: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (source) {
        reset({
          name: source.name,
          amount: source.amount,
          frequency: source.frequency as FormData['frequency'],
          nextPayDate: source.nextPayDate,
        });
      } else {
        reset({ name: '', amount: undefined, frequency: 'MONTHLY', nextPayDate: '' });
      }
    }
  }, [open, source, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Income Source' : 'Add Income Source'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this income source.' : 'Enter the details for your new income source.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Software Engineer Salary" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input id="amount" type="number" step="0.01" min="0.01" placeholder="0.00" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Controller
              name="frequency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Biweekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.frequency && <p className="text-sm text-destructive">{errors.frequency.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextPayDate">Next Pay Date</Label>
            <Input id="nextPayDate" type="date" {...register('nextPayDate')} />
            {errors.nextPayDate && <p className="text-sm text-destructive">{errors.nextPayDate.message}</p>}
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
