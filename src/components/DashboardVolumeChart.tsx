import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, getDaysInMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, addWeeks, addMonths, addYears, isAfter } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

export const DashboardVolumeChart = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [offset, setOffset] = useState(0);

  const today = new Date();

  const getReferenceDate = () => {
    switch (timePeriod) {
      case 'weekly': return addWeeks(today, offset);
      case 'monthly': return addMonths(today, offset);
      case 'yearly': return addYears(today, offset);
    }
  };

  const refDate = getReferenceDate();

  const getDateRange = () => {
    switch (timePeriod) {
      case 'weekly': return { start: startOfWeek(refDate, { weekStartsOn: 1 }), end: endOfWeek(refDate, { weekStartsOn: 1 }) };
      case 'monthly': return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
      case 'yearly': return { start: startOfYear(refDate), end: endOfYear(refDate) };
    }
  };

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'weekly': {
        const { start, end } = getDateRange();
        return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
      }
      case 'monthly': return format(refDate, 'MMMM yyyy');
      case 'yearly': return format(refDate, 'yyyy');
    }
  };

  const canGoForward = () => {
    const { end } = getDateRange();
    return !isAfter(end, today);
  };

  const handlePeriodChange = (value: string) => {
    if (value) {
      setTimePeriod(value as TimePeriod);
      setOffset(0);
    }
  };

  const { start: startDate, end: endDate } = getDateRange();
  const formatDateForQuery = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const { data: volumeData, isLoading } = useQuery({
    queryKey: ['assignments-volume', timePeriod, offset],
    queryFn: async () => {
      const groupBy = timePeriod === 'yearly' ? 'monthly' : 'daily';

      const { data, error } = await supabase.rpc('get_assignments_volume', {
        start_date: formatDateForQuery(startDate),
        end_date: formatDateForQuery(endDate),
        group_by: groupBy,
      });

      if (error) throw error;

      let dataPoints: { formattedDate: string; count: number }[];

      if (timePeriod === 'weekly') {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const countMap = new Map((data || []).map((r: any) => [r.period_date, Number(r.assignment_count)]));
        dataPoints = days.map(d => ({
          formattedDate: format(d, 'EEE'),
          count: countMap.get(formatDateForQuery(d)) || 0,
        }));
      } else if (timePeriod === 'monthly') {
        const daysInMonth = getDaysInMonth(refDate);
        const countMap = new Map((data || []).map((r: any) => [r.period_date, Number(r.assignment_count)]));
        dataPoints = Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(refDate.getFullYear(), refDate.getMonth(), i + 1);
          return {
            formattedDate: format(d, 'dd'),
            count: countMap.get(formatDateForQuery(d)) || 0,
          };
        });
      } else {
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        const countMap = new Map((data || []).map((r: any) => [r.period_date, Number(r.assignment_count)]));
        dataPoints = months.map(d => ({
          formattedDate: format(d, 'MMM'),
          count: countMap.get(formatDateForQuery(d)) || 0,
        }));
      }

      return dataPoints;
    },
    staleTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const totalAssignments = volumeData?.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <Card className="rounded-2xl border-border/30 bg-card shadow-sm">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Assignment Volume
            </CardTitle>
            {!isLoading && (
              <Badge variant="secondary" className="text-xs font-semibold rounded-full px-2.5">
                {totalAssignments.toLocaleString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-muted/60 rounded-xl px-1 py-0.5">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setOffset(o => o - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-medium text-foreground min-w-[110px] text-center select-none">
                {getPeriodLabel()}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => setOffset(o => o + 1)} disabled={!canGoForward()}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <ToggleGroup type="single" value={timePeriod} onValueChange={handlePeriodChange} className="bg-muted/60 rounded-xl p-0.5">
              <ToggleGroupItem value="weekly" aria-label="Weekly" className="text-xs px-3 py-1 h-7 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">
                Week
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Monthly" className="text-xs px-3 py-1 h-7 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">
                Month
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="Yearly" className="text-xs px-3 py-1 h-7 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">
                Year
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px] pt-0 px-5 pb-5">
        {isLoading ? (
          <div className="flex items-end justify-between h-full gap-1 pt-8 pb-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-muted animate-pulse rounded-t-md"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 10, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                interval={timePeriod === 'monthly' ? 'preserveStartEnd' : 0}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={35} />
              <Tooltip
                formatter={value => [`${value}`, 'Assignments']}
                labelFormatter={label => `${label}`}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  padding: '8px 12px',
                }}
              />
              <Bar
                dataKey="count"
                name="Assignments"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={timePeriod === 'yearly' ? 40 : 20}
                fillOpacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
