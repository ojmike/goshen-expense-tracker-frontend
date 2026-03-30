import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';

export function useAnalytics(year: number, month: number, months: number = 6) {
  return useQuery({
    queryKey: ['analytics', year, month, months],
    queryFn: () => analyticsService.get(year, month, months),
  });
}
