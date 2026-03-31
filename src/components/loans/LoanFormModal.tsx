import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  originalAmount: z.number().positive('Amount must be greater than 0'),
});

type FormData = z.infer<typeof schema>;

interface LoanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function LoanFormModal({ open, onOpenChange, onSubmit }: LoanFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { name: '', originalAmount: undefined },
  });

  useEffect(() => {
    if (open) {
      reset({ name: '', originalAmount: undefined });
    }
  }, [open, reset]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch {
      // Error handling delegated to parent via React Query's onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Loan</DialogTitle>
          <DialogDescription>Enter the details for your new loan.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Student Loan" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalAmount">Original Amount ($)</Label>
            <Input
              id="originalAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register('originalAmount', { valueAsNumber: true })}
            />
            {errors.originalAmount && <p className="text-sm text-destructive">{errors.originalAmount.message}</p>}
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
