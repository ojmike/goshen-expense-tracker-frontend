import { useEffect, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
  secondPayDay: z.number().min(1).max(31).nullable().optional(),
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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      amount: undefined,
      frequency: 'MONTHLY',
      nextPayDate: '',
      secondPayDay: null,
    },
  });

  const frequency = useWatch({ control, name: 'frequency' });
  const nextPayDate = useWatch({ control, name: 'nextPayDate' });
  const didAutoSet = useRef(false);

  // Auto-default second pay day when biweekly is selected
  useEffect(() => {
    if (frequency === 'BIWEEKLY' && nextPayDate && !didAutoSet.current) {
      const day = new Date(nextPayDate).getUTCDate();
      const defaultSecond = day <= 15 ? day + 15 : day - 15;
      setValue('secondPayDay', Math.min(Math.max(defaultSecond, 1), 28));
      didAutoSet.current = true;
    }
    if (frequency !== 'BIWEEKLY') {
      didAutoSet.current = false;
    }
  }, [frequency, nextPayDate, setValue]);

  useEffect(() => {
    if (open) {
      if (source) {
        reset({
          name: source.name,
          amount: source.amount,
          frequency: source.frequency as FormData['frequency'],
          nextPayDate: source.nextPayDate,
          secondPayDay: source.secondPayDay ?? null,
        });
      } else {
        reset({ name: '', amount: undefined, frequency: 'MONTHLY', nextPayDate: '', secondPayDay: null });
      }
    }
  }, [open, source, reset]);

  const handleFormSubmit = async (data: FormData) => {
    if (data.frequency !== 'BIWEEKLY') {
      data.secondPayDay = null;
    }
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
            <Label htmlFor="amount">Amount per paycheck ($)</Label>
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
                    <SelectItem value="BIWEEKLY">Biweekly (twice a month)</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.frequency && <p className="text-sm text-destructive">{errors.frequency.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextPayDate">{frequency === 'BIWEEKLY' ? 'First Pay Date' : 'Next Pay Date'}</Label>
            <Input id="nextPayDate" type="date" {...register('nextPayDate')} />
            {errors.nextPayDate && <p className="text-sm text-destructive">{errors.nextPayDate.message}</p>}
          </div>

          {frequency === 'BIWEEKLY' && (
            <div className="space-y-2">
              <Label htmlFor="secondPayDay">Second Pay Day of Month</Label>
              <Input
                id="secondPayDay"
                type="number"
                min="1"
                max="31"
                placeholder="e.g. 20"
                {...register('secondPayDay', { valueAsNumber: true, setValueAs: (v) => (v === '' || v === undefined ? null : Number(v)) })}
              />
              <p className="text-xs text-muted-foreground">
                Enter the day of the month for your second paycheck (e.g. if you get paid on the 5th and 20th, enter 20)
              </p>
              {errors.secondPayDay && <p className="text-sm text-destructive">{errors.secondPayDay.message}</p>}
            </div>
          )}

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
