import { useState } from 'react';
import { Loader2, DollarSign, TrendingDown, Wallet, Landmark } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function Dashboard() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading } = useDashboard(year, month);

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">Welcome, {user?.firstName || user?.email}</h1>

        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-start gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="text-2xl font-semibold">{currencyFormat.format(data.totalMonthlyIncome)}</p>
                  <p className="text-xs text-muted-foreground">{data.incomeSourceCount} income source{data.incomeSourceCount !== 1 ? 's' : ''}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-3">
                <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <TrendingDown className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                  <p className="text-2xl font-semibold">{currencyFormat.format(data.totalMonthlyExpenses)}</p>
                  <p className="text-xs text-muted-foreground">{data.expenseCount} expense{data.expenseCount !== 1 ? 's' : ''}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${data.leftover >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                  <Wallet className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leftover</p>
                  <p className={`text-2xl font-semibold ${data.leftover >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {currencyFormat.format(data.leftover)}
                  </p>
                  <p className="text-xs text-muted-foreground">Income minus expenses</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Landmark className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Debt</p>
                  <p className="text-2xl font-semibold">{currencyFormat.format(data.totalRemainingDebt)}</p>
                  <p className="text-xs text-muted-foreground">{currencyFormat.format(data.totalDebtPaid)} paid so far</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
