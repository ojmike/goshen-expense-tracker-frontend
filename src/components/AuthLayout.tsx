import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 pt-12 sm:pt-12">
      <h1 className="mb-6 text-2xl font-semibold leading-tight">Goshen</h1>
      <div className="w-full max-w-[400px]">
        <Card className="border-0 shadow-none sm:border sm:border-border sm:shadow-sm">
          <CardHeader className="px-4 pt-6 pb-0 sm:px-6">
            <h2 className="text-xl font-semibold leading-tight">{title}</h2>
            {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          </CardHeader>
          <CardContent className="px-4 pb-6 pt-4 sm:px-6">
            {children}
          </CardContent>
        </Card>
        {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
