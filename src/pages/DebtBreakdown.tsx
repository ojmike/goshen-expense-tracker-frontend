import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useDashboard } from '@/hooks/useDashboard';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#d946ef', '#ea580c', '#0891b2', '#6d28d9'];

const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const renderCustomLabel = ({ name, percent }: { name?: string; percent?: number }) =>
  percent != null && percent > 0.05 ? `${name ?? ''} ${(percent * 100).toFixed(0)}%` : '';

export default function DebtBreakdown() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [year, setYear] = useState(Number(params.get('year')) || new Date().getFullYear());
  const [month, setMonth] = useState(Number(params.get('month')) || new Date().getMonth() + 1);

  const { data, isLoading } = useDashboard(year, month);

  const loans = data?.loans ?? [];
  const totalDebt = data?.totalRemainingDebt ?? 0;
  const totalPaid = data?.totalDebtPaid ?? 0;
  const totalOriginal = loans.reduce((sum, l) => sum + l.originalAmount, 0);
  const overallProgress = totalOriginal > 0 ? ((totalPaid / totalOriginal) * 100).toFixed(1) : '0';

  // Pie: remaining debt by loan
  const debtChart = loans
    .filter((l) => l.remainingBalance > 0)
    .map((l) => ({ name: l.name, value: l.remainingBalance }));

  // Pie: paid vs remaining overall
  const progressChart = [
    { name: 'Paid Off', value: totalPaid },
    { name: 'Remaining', value: totalDebt },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-xs" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Debt Breakdown</h1>
          </div>
        </div>

        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-blue-50 p-5 text-center dark:bg-blue-950/30">
                <p className="text-sm text-muted-foreground">Total Remaining</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currencyFormat.format(totalDebt)}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-5 text-center dark:bg-emerald-950/30">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{currencyFormat.format(totalPaid)}</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-5 text-center dark:bg-indigo-950/30">
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{loans.length} loan{loans.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Overall Progress Pie */}
            {totalOriginal > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payoff Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressChart}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(v) => currencyFormat.format(Number(v))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Debt Distribution Pie */}
            {debtChart.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Debt Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={debtChart}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={false}
                      >
                        {debtChart.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => currencyFormat.format(Number(v))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Loan List */}
            <Card>
              <CardHeader>
                <CardTitle>Loans</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {loans.map((loan, i) => {
                    const progress = loan.originalAmount > 0
                      ? (loan.totalPaid / loan.originalAmount) * 100
                      : 0;
                    return (
                      <div key={loan.id} className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div className="flex-1">
                            <p className="font-medium">{loan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Original: {currencyFormat.format(loan.originalAmount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{currencyFormat.format(loan.remainingBalance)}</p>
                            <p className="text-sm text-muted-foreground">{currencyFormat.format(loan.totalPaid)} paid</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 ml-7 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 ml-7 text-xs text-muted-foreground">{Math.min(progress, 100).toFixed(1)}% paid off</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
