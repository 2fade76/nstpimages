import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, getDaysInMonth, getDate, isValid, startOfWeek, endOfWeek, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MoreHorizontal } from "lucide-react";

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

export const DashboardVolumeChart = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
    }
  };

  const {
    data: volumeData,
    isLoading
  } = useQuery({
    queryKey: ['assignments-volume', timePeriod],
    queryFn: async () => {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;
      let dataPoints: { date: Date; formattedDate: string; count: number }[] = [];

      if (timePeriod === 'weekly') {
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        endDate = endOfWeek(today, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        dataPoints = days.map(date => ({
          date,
          formattedDate: format(date, 'EEE'),
          count: 0
        }));
      } else if (timePeriod === 'monthly') {
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        const daysInMonth = getDaysInMonth(today);
        dataPoints = Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
          return {
            date,
            formattedDate: format(date, 'MMM dd'),
            count: 0
          };
        });
      } else {
        startDate = startOfYear(today);
        endDate = endOfYear(today);
        const months = eachMonthOfInterval({ start: startDate, end: endDate });
        dataPoints = months.map(date => ({
          date,
          formattedDate: format(date, 'MMM'),
          count: 0
        }));
      }

      // Format dates as YYYY-MM-DD for proper date comparison
      const formatDateForQuery = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };

      const { data, error } = await supabase
        .from('assignments')
        .select('date')
        .gte('date', formatDateForQuery(startDate))
        .lte('date', formatDateForQuery(endDate));

      if (error) throw error;

      if (data) {
        data.forEach(assignment => {
          const assignmentDate = new Date(assignment.date);
          if (isValid(assignmentDate)) {
            if (timePeriod === 'weekly') {
              const dayIndex = dataPoints.findIndex(dp => 
                format(dp.date, 'yyyy-MM-dd') === format(assignmentDate, 'yyyy-MM-dd')
              );
              if (dayIndex >= 0) dataPoints[dayIndex].count += 1;
            } else if (timePeriod === 'monthly') {
              const dayOfMonth = getDate(assignmentDate) - 1;
              if (dayOfMonth >= 0 && dayOfMonth < dataPoints.length) {
                dataPoints[dayOfMonth].count += 1;
              }
            } else {
              const monthIndex = assignmentDate.getMonth();
              if (monthIndex >= 0 && monthIndex < dataPoints.length) {
                dataPoints[monthIndex].count += 1;
              }
            }
          }
        });
      }
      return dataPoints;
    },
    staleTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  return (
    <Card className="border-border/40 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Assignments Volume
          </CardTitle>
          <div className="flex items-center gap-2">
            <ToggleGroup 
              type="single" 
              value={timePeriod} 
              onValueChange={(value) => value && setTimePeriod(value as TimePeriod)}
              className="bg-muted/50 rounded-lg p-0.5"
            >
              <ToggleGroupItem value="weekly" aria-label="Weekly" className="text-xs px-2.5 py-1 h-7 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                Week
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Monthly" className="text-xs px-2.5 py-1 h-7 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                Month
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="Yearly" className="text-xs px-2.5 py-1 h-7 data-[state=on]:bg-background data-[state=on]:shadow-sm">
                Year
              </ToggleGroupItem>
            </ToggleGroup>
            <button className="p-1.5 hover:bg-muted rounded-md">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px] pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-3 w-full">
              <div className="h-6 w-full bg-muted animate-pulse rounded" />
              <div className="h-6 w-full bg-muted animate-pulse rounded" />
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-6 w-5/6 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                interval={timePeriod === 'monthly' ? 'preserveStartEnd' : 0} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                width={30} 
              />
              <Tooltip 
                formatter={value => [`${value}`, 'Assignments']} 
                labelFormatter={label => `${label}`} 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                iconType="circle" 
                iconSize={8}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Assignments" 
                stroke="hsl(var(--chart-primary))" 
                strokeWidth={2} 
                activeDot={{ r: 4, fill: 'hsl(var(--chart-primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }} 
                dot={{ r: 2, fill: 'hsl(var(--chart-primary))' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
