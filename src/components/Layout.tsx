import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <span className="text-xl font-semibold">Goshen</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
      </nav>
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
