import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useDashboard } from '@/hooks/useDashboard';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#e11d48', '#8b5cf6', '#0891b2', '#d946ef', '#ea580c'];

const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const frequencyLabels: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Biweekly',
  MONTHLY: 'Monthly',
};

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const renderCustomLabel = ({ name, percent }: { name: string; percent: number }) =>
  percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : '';

export default function IncomeBreakdown() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [year, setYear] = useState(Number(params.get('year')) || new Date().getFullYear());
  const [month, setMonth] = useState(Number(params.get('month')) || new Date().getMonth() + 1);

  const { data, isLoading } = useDashboard(year, month);

  const carryOver = data?.carryOver ?? 0;
  const chartData = [
    ...(data?.incomeSources?.map((s) => ({
      name: s.name,
      value: s.monthlyEquivalent,
    })) ?? []),
    ...(carryOver !== 0 ? [{ name: carryOver > 0 ? 'Carry Over' : 'Carried Debt', value: Math.abs(carryOver) }] : []),
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-xs" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Income Breakdown</h1>
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
            <div className="rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
              <p className="text-sm text-muted-foreground">Total Available</p>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {currencyFormat.format(data.totalMonthlyIncome + carryOver)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                from {data.incomeSourceCount} source{data.incomeSourceCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Pie Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Income Distribution</CardTitle>
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

            {/* Detail List */}
            <Card>
              <CardHeader>
                <CardTitle>Sources</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {data.incomeSources?.map((source, i) => (
                    <div key={source.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div className="flex-1">
                        <p className="font-medium">{source.name}</p>
                        <p className="text-sm text-muted-foreground">{frequencyLabels[source.frequency] ?? source.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{currencyFormat.format(source.amount)}</p>
                        {source.frequency !== 'MONTHLY' && (
                          <p className="text-sm text-muted-foreground">{currencyFormat.format(source.monthlyEquivalent)}/mo</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {carryOver !== 0 && (
                    <div className="flex items-center gap-4 px-6 py-4">
                      <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[(data.incomeSources?.length ?? 0) % COLORS.length] }} />
                      <div className="flex-1">
                        <p className="font-medium">{carryOver > 0 ? 'Carry Over' : 'Carried Debt'}</p>
                        <p className="text-sm text-muted-foreground">From previous months</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${carryOver < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                          {currencyFormat.format(carryOver)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
