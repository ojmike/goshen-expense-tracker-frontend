import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <span className="text-xl font-semibold">Goshen</span>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/expenses" className="text-muted-foreground hover:text-foreground transition-colors">Expenses</Link>
            <Link to="/loans" className="text-muted-foreground hover:text-foreground transition-colors">Loans</Link>
            <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
            <Link to="/bank-accounts" className="text-muted-foreground hover:text-foreground transition-colors">Bank</Link>
            <Link to="/transactions" className="text-muted-foreground hover:text-foreground transition-colors">Transactions</Link>
            <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
        </div>
      </nav>
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
