import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const { user } = useAuth();
  const date = new Date(year, month - 1);

  const minYear = user?.trackingStartYear;
  const minMonth = user?.trackingStartMonth;
  const isAtMin = minYear != null && minMonth != null &&
    (year < minYear || (year === minYear && month <= minMonth));

  const handlePrev = () => {
    if (isAtMin) return;
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={handlePrev} disabled={isAtMin} aria-label="Previous month">
        <ChevronLeft />
      </Button>
      <span className="min-w-[140px] text-center text-sm font-medium">
        {format(date, 'MMMM yyyy')}
      </span>
      <Button variant="outline" size="icon-sm" onClick={handleNext} aria-label="Next month">
        <ChevronRight />
      </Button>
    </div>
  );
}
