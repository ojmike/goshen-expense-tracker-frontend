import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import authService from '../services/authService';

const schema = z.object({
  email: z.string().min(1, 'This field is required.').email('Please enter a valid email address.'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

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
    setFocus('email');
  }, [setFocus]);

  const onSubmit = async (data: FormData) => {
    await authService.forgotPassword(data.email);
    setSent(true);
  };

  return (
    <AuthLayout
      title={sent ? 'Check your email' : 'Reset your password'}
      description={sent ? undefined : "Enter your email and we'll send you a reset link."}
      footer={<Link to="/login" className="hover:underline">Back to sign in</Link>}
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we sent a password reset link. It expires in 1 hour.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
