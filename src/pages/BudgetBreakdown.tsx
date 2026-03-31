import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';

const clampYear = (v: string | null) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 2000 && n <= 2100 ? n : new Date().getFullYear();
};
const clampMonth = (v: string | null) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : new Date().getMonth() + 1;
};

import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useDashboard, useCashFlow } from '@/hooks/useDashboard';

const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function BudgetBreakdown() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [year, setYear] = useState(clampYear(params.get('year')));
  const [month, setMonth] = useState(clampMonth(params.get('month')));

  const { data: dashboard, isLoading: dashLoading } = useDashboard(year, month);
  const { data: cashflow, isLoading: cfLoading } = useCashFlow(year, month);

  const isLoading = dashLoading || cfLoading;
  const income = dashboard?.totalMonthlyIncome ?? 0;
  const expenses = dashboard?.totalMonthlyExpenses ?? 0;
  const leftover = dashboard?.leftover ?? 0;

  // Chart data for running balance
  const chartData = cashflow?.events.map((e) => ({
    date: format(parseISO(e.date), 'MMM d'),
    balance: e.runningBalance,
    fullDate: e.date,
  })) ?? [];

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-xs" onClick={() => navigate('/dashboard')} aria-label="Back to dashboard">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Cash Flow Timeline</h1>
          </div>
        </div>

        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); setParams({ year: String(y), month: String(m) }, { replace: true }); }} />

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alert Banner */}
            {cashflow?.willGoNegative ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <AlertTriangle className="mt-0.5 size-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">Insufficient funds warning</p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Your balance drops to {currencyFormat.format(cashflow.lowestBalance)} on{' '}
                    {format(parseISO(cashflow.lowestBalanceDate), 'MMMM d')}. You may not have enough to cover all bills.
                  </p>
                </div>
              </div>
            ) : cashflow && cashflow.events.length > 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <CheckCircle className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">You're covered</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Your income covers all bills this month. Lowest balance: {currencyFormat.format(cashflow.lowestBalance)} on{' '}
                    {format(parseISO(cashflow.lowestBalanceDate), 'MMMM d')}.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-5 text-center dark:bg-emerald-950/30">
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{currencyFormat.format(income)}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-5 text-center dark:bg-red-950/30">
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{currencyFormat.format(expenses)}</p>
              </div>
              <div className={`rounded-xl p-5 text-center ${leftover >= 0 ? 'bg-indigo-50 dark:bg-indigo-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
                <p className="text-sm text-muted-foreground">End of Month</p>
                <p className={`text-2xl font-bold ${leftover >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                  {currencyFormat.format(leftover)}
                </p>
              </div>
            </div>

            {/* Running Balance Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Running Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => currencyFormat.format(v)} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => currencyFormat.format(Number(v))} labelFormatter={(label) => `Date: ${label}`} />
                      <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '$0', position: 'right', fill: '#ef4444', fontSize: 12 }} />
                      <Area
                        type="stepAfter"
                        dataKey="balance"
                        name="Balance"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#balanceGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Cash Flow Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {cashflow?.events.map((event, i) => {
                    const isIncome = event.type === 'INCOME';
                    const isNegativeBalance = event.runningBalance < 0;
                    return (
                      <div key={i} className={`flex items-center gap-4 px-6 py-4 ${isNegativeBalance ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                        <div className={`rounded-full p-2 ${isIncome ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                          {isIncome ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(event.date), 'EEEE, MMMM d')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isIncome ? '+' : ''}{currencyFormat.format(event.amount)}
                          </p>
                          <p className={`text-sm ${isNegativeBalance ? 'font-medium text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                            Bal: {currencyFormat.format(event.runningBalance)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {(!cashflow || cashflow.events.length === 0) && (
                    <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No income or expenses recorded for this month. Add your pay dates and bills to see your cash flow.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
