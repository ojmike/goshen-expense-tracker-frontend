import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '../components/AuthLayout';
import authService from '../services/authService';

const schema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string().min(1, 'This field is required.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (token) setFocus('newPassword');
  }, [setFocus, token]);

  if (!token) {
    return (
      <AuthLayout title="Set new password" footer={<Link to="/login" className="hover:underline">Back to sign in</Link>}>
        <Alert variant="destructive">
          <AlertDescription>
            This reset link has expired or is invalid.{' '}
            <Link to="/forgot-password" className="underline">Request a new one.</Link>
          </AlertDescription>
        </Alert>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password updated" footer={<Link to="/login" className="hover:underline">Back to sign in</Link>}>
        <p className="text-sm text-muted-foreground">
          Your password has been reset. You can now{' '}
          <Link to="/login" className="text-foreground font-medium underline">sign in with your new password</Link>.
        </p>
      </AuthLayout>
    );
  }

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await authService.resetPassword(token, data.newPassword);
      setSuccess(true);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setServerError('This reset link has expired or is invalid. Request a new one.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      footer={<Link to="/login" className="hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>
              {serverError}{' '}
              {serverError.includes('expired') && <Link to="/forgot-password" className="underline">Request a new one.</Link>}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" {...register('newPassword')} />
          {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset password'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
