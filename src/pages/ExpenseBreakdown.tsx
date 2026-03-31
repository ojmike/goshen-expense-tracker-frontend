import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useDashboard } from '@/hooks/useDashboard';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#d946ef', '#0891b2', '#ea580c', '#6d28d9', '#0d9488', '#e11d48'];

const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const renderCustomLabel = ({ name, percent }: { name?: string; percent?: number }) =>
  percent != null && percent > 0.05 ? `${name ?? ''} ${(percent * 100).toFixed(0)}%` : '';

export default function ExpenseBreakdown() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [year, setYear] = useState(Number(params.get('year')) || new Date().getFullYear());
  const [month, setMonth] = useState(Number(params.get('month')) || new Date().getMonth() + 1);

  const { data, isLoading } = useDashboard(year, month);

  const chartData = data?.expensesByCategory?.map((c) => ({
    name: c.categoryName,
    value: c.totalAmount,
    count: c.count,
  })) ?? [];

  const total = data?.totalMonthlyExpenses ?? 0;

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-xs" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Expense Breakdown</h1>
          </div>
        </div>

        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Total */}
            <div className="rounded-xl bg-red-50 p-6 text-center dark:bg-red-950/30">
              <p className="text-sm text-muted-foreground">Total Monthly Expenses</p>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                {currencyFormat.format(total)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.expenseCount} expense{data.expenseCount !== 1 ? 's' : ''} across {chartData.length} categor{chartData.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>

            {/* Pie Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={false}
                      >
                        {chartData.map((_, i) => (
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

            {/* Category List */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {chartData.map((cat, i) => {
                    const pct = total > 0 ? ((cat.value / total) * 100).toFixed(1) : '0';
                    return (
                      <div key={cat.name} className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div className="flex-1">
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-sm text-muted-foreground">{cat.count} item{cat.count !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{currencyFormat.format(cat.value)}</p>
                            <p className="text-sm text-muted-foreground">{pct}%</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 ml-7 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${total > 0 ? (cat.value / total) * 100 : 0}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
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
