import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, DollarSign, TrendingDown, Wallet, Landmark, ChevronRight, ArrowRightLeft, CalendarClock } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MonthSelector from '@/components/expenses/MonthSelector';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

const currencyFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard() {
  const { user, setTrackingStart } = useAuth();
  const navigate = useNavigate();
  const now = new Date();
  const trackY = user?.trackingStartYear;
  const trackM = user?.trackingStartMonth;
  const [year, setYear] = useState(trackY ?? now.getFullYear());
  const [month, setMonth] = useState(trackM ?? now.getMonth() + 1);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(now.getMonth() + 1);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const { data, isLoading } = useDashboard(year, month);

  const goTo = (path: string) => navigate(`${path}?year=${year}&month=${month}`);

  const hasTrackingStart = user?.trackingStartYear != null && user?.trackingStartMonth != null;

  const handleSetStart = async () => {
    await setTrackingStart(startYear, startMonth);
    setShowStartPicker(false);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-10 py-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Welcome, {user?.firstName || user?.email}</h1>
          <p className="text-muted-foreground">Your financial overview at a glance.</p>
        </div>

        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

        {!hasTrackingStart && !showStartPicker && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardContent className="flex items-center gap-4 p-4">
              <CalendarClock className="size-5 text-amber-600 dark:text-amber-400" />
              <div className="flex-1">
                <p className="font-medium">Set your tracking start month</p>
                <p className="text-sm text-muted-foreground">Choose when you started tracking expenses so carry over calculates correctly.</p>
              </div>
              <Button size="sm" onClick={() => setShowStartPicker(true)}>Set Start Month</Button>
            </CardContent>
          </Card>
        )}

        {(showStartPicker || (hasTrackingStart && showStartPicker)) && (
          <Card>
            <CardContent className="flex flex-wrap items-end gap-4 p-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Year</label>
                <Select value={String(startYear)} onValueChange={(v) => setStartYear(Number(v))}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => now.getFullYear() - i).map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Month</label>
                <Select value={String(startMonth)} onValueChange={(v) => setStartMonth(Number(v))}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.slice(1).map((name, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSetStart}>Save</Button>
              <Button variant="ghost" onClick={() => setShowStartPicker(false)}>Cancel</Button>
            </CardContent>
          </Card>
        )}

        {hasTrackingStart && !showStartPicker && (
          <p className="text-sm text-muted-foreground">
            Tracking since {MONTHS[user.trackingStartMonth!]} {user.trackingStartYear}
            {' '}
            <button className="text-primary underline underline-offset-2" onClick={() => { setStartYear(user.trackingStartYear!); setStartMonth(user.trackingStartMonth!); setShowStartPicker(true); }}>
              Change
            </button>
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
            <Card className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-emerald-200 dark:hover:ring-emerald-800" onClick={() => goTo('/dashboard/income')}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <DollarSign className="size-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="text-3xl font-semibold">{currencyFormat.format(data.totalMonthlyIncome + data.carryOver)}</p>
                  <div className="space-y-0.5 text-sm text-muted-foreground">
                    <p>Job Income: {currencyFormat.format(data.totalMonthlyIncome)}</p>
                    <p className={data.carryOver < 0 ? 'text-red-500' : ''}>
                      {data.carryOver >= 0 ? 'Carry Over' : 'Carried Debt'}: {currencyFormat.format(data.carryOver)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-red-200 dark:hover:ring-red-800" onClick={() => goTo('/dashboard/expenses')}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-950 dark:text-red-400">
                  <TrendingDown className="size-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                  <p className="text-3xl font-semibold">{currencyFormat.format(data.totalMonthlyExpenses)}</p>
                  <p className="text-sm text-muted-foreground">{data.expenseCount} expense{data.expenseCount !== 1 ? 's' : ''}</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <div className={`rounded-xl p-3 ${data.carryOver >= 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                  <ArrowRightLeft className="size-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">{data.carryOver >= 0 ? 'Carry Over' : 'Carried Debt'}</p>
                  <p className={`text-3xl font-semibold ${data.carryOver >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                    {currencyFormat.format(data.carryOver)}
                  </p>
                  <p className="text-sm text-muted-foreground">From previous month</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-start gap-4 p-6">
                <div className={`rounded-xl p-3 ${data.leftover >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                  <Wallet className="size-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">Leftover</p>
                  <p className={`text-3xl font-semibold ${data.leftover >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {currencyFormat.format(data.leftover)}
                  </p>
                  <p className="text-sm text-muted-foreground">After all expenses this month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-indigo-200 dark:hover:ring-indigo-800" onClick={() => goTo('/dashboard/budget')}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Wallet className="size-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">Cash Flow Analysis</p>
                  <p className="text-lg font-semibold">View Timeline</p>
                  <p className="text-sm text-muted-foreground">Pay dates vs bill dates</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-all hover:shadow-md hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800" onClick={() => goTo('/dashboard/debt')}>
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <Landmark className="size-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-muted-foreground">Total Debt</p>
                  <p className="text-3xl font-semibold">{currencyFormat.format(data.totalRemainingDebt)}</p>
                  <p className="text-sm text-muted-foreground">{currencyFormat.format(data.totalDebtPaid)} paid so far</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
