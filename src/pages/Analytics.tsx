import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useAnalytics } from '@/hooks/useAnalytics';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const percentFormat = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

function monthLabel(year: number, month: number) {
  return `${MONTHS[month - 1]} ${year}`;
}

export default function Analytics() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading } = useAnalytics(year, month);

  const summaryData = data?.monthlySummaries.map((s) => ({
    label: monthLabel(s.year, s.month),
    income: s.totalIncome,
    expenses: s.totalExpenses,
    leftover: s.leftover,
    savingsRate: s.savingsRate,
  })) ?? [];

  const debtData = data?.debtSnapshots.map((d) => ({
    label: monthLabel(d.year, d.month),
    remaining: d.totalRemainingDebt,
    paid: d.totalPaid,
  })) ?? [];

  const trendData = data?.categoryTrends.filter(
    (t) => t.currentMonthAmount > 0 || t.previousMonthAmount > 0
  ) ?? [];

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-semibold">Trends & Analytics</h1>

        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* DASH-03: Category Spending Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No expense data for comparison</p>
                ) : (
                  <div className="space-y-3">
                    {trendData.map((t) => (
                      <div key={t.categoryName} className="flex items-center justify-between rounded-lg border px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{t.categoryName}</p>
                          <p className="text-xs text-muted-foreground">
                            {currencyFormat.format(t.previousMonthAmount)} → {currencyFormat.format(t.currentMonthAmount)}
                          </p>
                        </div>
                        <span className={`text-sm font-medium ${t.changePercent > 0 ? 'text-red-600 dark:text-red-400' : t.changePercent < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                          {t.previousMonthAmount === 0 && t.currentMonthAmount > 0 ? 'New' : percentFormat(t.changePercent)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DASH-06: Net Leftover Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Net Leftover Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={summaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => currencyFormat.format(v)} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => currencyFormat.format(Number(v))} />
                      <Legend />
                      <ReferenceLine y={0} stroke="#888" />
                      <Bar dataKey="income" name="Income" fill="#10b981" />
                      <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                      <Bar dataKey="leftover" name="Leftover" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* DASH-04: Savings Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Savings Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={summaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
                      <Line type="monotone" dataKey="savingsRate" name="Savings Rate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* DASH-05: Debt Paydown */}
            <Card>
              <CardHeader>
                <CardTitle>Debt Paydown</CardTitle>
              </CardHeader>
              <CardContent>
                {debtData.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No loan payment data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={debtData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => currencyFormat.format(v)} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => currencyFormat.format(Number(v))} />
                      <Legend />
                      <Line type="monotone" dataKey="remaining" name="Remaining Debt" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="paid" name="Total Paid" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
