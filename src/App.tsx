import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import IncomeBreakdown from './pages/IncomeBreakdown';
import ExpenseBreakdown from './pages/ExpenseBreakdown';
import BudgetBreakdown from './pages/BudgetBreakdown';
import DebtBreakdown from './pages/DebtBreakdown';
import Settings from './pages/Settings';
import Expenses from './pages/Expenses';
import Loans from './pages/Loans';
import Analytics from './pages/Analytics';
import BankAccounts from './pages/BankAccounts';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/income" element={<IncomeBreakdown />} />
          <Route path="/dashboard/expenses" element={<ExpenseBreakdown />} />
          <Route path="/dashboard/budget" element={<BudgetBreakdown />} />
          <Route path="/dashboard/debt" element={<DebtBreakdown />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/bank-accounts" element={<BankAccounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
