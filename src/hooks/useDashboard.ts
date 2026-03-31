import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboard(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard', year, month],
    queryFn: () => dashboardService.getOverview(year, month),
  });
}

export function useCashFlow(year: number, month: number) {
  return useQuery({
    queryKey: ['cashflow', year, month],
    queryFn: () => dashboardService.getCashFlow(year, month),
  });
}
