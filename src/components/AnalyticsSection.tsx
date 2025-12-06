import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, LabelList, Sector } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, parseISO, subMonths, startOfMonth, endOfMonth, getDaysInMonth, getDate, isValid, startOfWeek, endOfWeek, startOfYear, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { Assignment, Photographer } from "@/types/database";
import { AnalyticsCardSkeleton } from "./ui/skeleton-loaders";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TimePeriod = 'weekly' | 'monthly' | 'yearly';
import { useTopPhotographers } from "@/hooks/useTopPhotographers";

interface DailyAssignmentData {
  date: Date;
  formattedDate: string;
  count: number;
}
interface PhotographerAssignmentData {
  [photographerName: string]: number;
}
interface DateGroupedData {
  date: string;
  photographers: PhotographerAssignmentData;
}
interface ChartDataPoint {
  date: string;
  [photographerName: string]: string | number;
}
interface CompletedAssignmentsData {
  chartData: ChartDataPoint[];
  photographers: string[];
}
interface MonthlyDataPoint {
  month: string;
  [photographer: string]: string | number;
}
interface MonthlyCompletionsData {
  chartData: MonthlyDataPoint[];
  photographers: string[];
}
type AssignmentWithPhotographer = Assignment & {
  photographers?: Photographer;
};
interface TopPhotographer {
  id: string;
  name: string;
  completedCount: number;
  rank: number;
}

interface CategoryData {
  name: string;
  value: number;
  fill: string;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-lg font-semibold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-sm">
        {value} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};
export const AnalyticsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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

      const { data, error } = await supabase
        .from('assignments')
        .select('date')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

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
  const {
    data: completedAssignmentsData,
    isLoading: isLoadingCompletedData
  } = useQuery<CompletedAssignmentsData>({
    queryKey: ['completed-assignments-by-date'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('assignments').select(`
          id,
          date,
          photographer_id,
          photographers (name)
        `).eq('status', 'complete').order('date', {
        ascending: true
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          chartData: [],
          photographers: []
        };
      }
      const groupedByDate: Record<string, DateGroupedData> = {};
      (data as AssignmentWithPhotographer[]).forEach(assignment => {
        const dateString = format(parseISO(assignment.date), 'MMM dd');
        const photographerName = assignment.photographers?.name || 'Unknown';
        if (!groupedByDate[dateString]) {
          groupedByDate[dateString] = {
            date: dateString,
            photographers: {}
          };
        }
        if (!groupedByDate[dateString].photographers[photographerName]) {
          groupedByDate[dateString].photographers[photographerName] = 0;
        }
        groupedByDate[dateString].photographers[photographerName] += 1;
      });
      const uniquePhotographers = new Set<string>();
      (data as AssignmentWithPhotographer[]).forEach(assignment => {
        uniquePhotographers.add(assignment.photographers?.name || 'Unknown');
      });
      const chartData: ChartDataPoint[] = Object.values(groupedByDate).map(item => {
        const dateData: ChartDataPoint = {
          date: item.date
        };
        Array.from(uniquePhotographers).forEach(photographer => {
          dateData[photographer] = item.photographers[photographer] || 0;
        });
        return dateData;
      });
      chartData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      return {
        chartData,
        photographers: Array.from(uniquePhotographers)
      };
    },
    staleTime: 60000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
  const {
    data: monthlyCompletionsData,
    isLoading: isLoadingMonthlyData
  } = useQuery({
    queryKey: ['monthly-completions-total'],
    queryFn: async () => {
      // Use RPC to fetch monthly grouped counts from Jan 2025 to current month (includes zero months)
      const startDate = new Date(2025, 0, 1);
      const endDate = new Date();

      const { data, error } = await supabase.rpc('get_monthly_completed_assignments', {
        start_date: startOfMonth(startDate).toISOString().slice(0, 10),
        end_date: startOfMonth(endDate).toISOString().slice(0, 10),
      });

      if (error) throw error;
      if (!data) {
        return { chartData: [] };
      }

      // Map RPC results to chart format with dynamic labels
      const chartData = (data as { month_key: string; total: number }[]).map((row) => {
        const date = parseISO(`${row.month_key}-01`);
        return {
          month: format(date, 'MMM yyyy'),
          total: row.total ?? 0,
        };
      });

      return {
        chartData,
      };
    },
    staleTime: 60000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
  const COLORS = {
    total: '#6366f1',
    open: '#f97316',
    progress: '#3b82f6',
    complete: '#4ade80',
    cancel: '#ef4444'
  };
  const getColor = (index: number) => {
    const colorPalette = ['#4ade80', '#3b82f6', '#f97316', '#ef4444', '#9b87f5', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4'];
    return colorPalette[index % colorPalette.length];
  };

  // Custom bar shape component for rounded bars
  const RoundedBar = (props: any) => {
    const {
      fill,
      x,
      y,
      width,
      height
    } = props;
    const radius = Math.min(width / 6, 8); // Limit radius to prevent overly rounded bars

    return <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} rx={radius} ry={radius} />
      </g>;
  };
  const {
    data: topPhotographersData,
    isLoading: isLoadingTopPhotographers
  } = useTopPhotographers();

  const CATEGORY_COLORS: Record<string, string> = {
    News: '#3b82f6',
    Sports: '#22c55e', 
    Entertainment: '#f59e0b'
  };

  const {
    data: categoryData,
    isLoading: isLoadingCategoryData
  } = useQuery({
    queryKey: ['category-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('category');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {
        News: 0,
        Sports: 0,
        Entertainment: 0
      };
      
      data?.forEach((item) => {
        const cat = item.category as string;
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
      
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        fill: CATEGORY_COLORS[name]
      })) as CategoryData[];
    },
    staleTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
  return <div className="grid gap-6">
      <Card className="shadow-sm border-gray-100 dark:border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Assignments Volume - {getTimePeriodLabel()}
            </CardTitle>
            <ToggleGroup 
              type="single" 
              value={timePeriod} 
              onValueChange={(value) => value && setTimePeriod(value as TimePeriod)}
              className="justify-start"
            >
              <ToggleGroupItem value="weekly" aria-label="Weekly" className="text-xs px-3">
                Weekly
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Monthly" className="text-xs px-3">
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem value="yearly" aria-label="Yearly" className="text-xs px-3">
                Yearly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="h-[350px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full px-8">
                <div className="h-8 w-full bg-muted animate-pulse rounded" />
                <div className="h-8 w-full bg-muted animate-pulse rounded" />
                <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-8 w-5/6 bg-muted animate-pulse rounded" />
                <div className="h-8 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 40
              }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" strokeOpacity={0.6} className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="formattedDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                  interval={timePeriod === 'monthly' ? 'preserveStartEnd' : 0} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{
                  fontSize: 11,
                  fill: 'hsl(var(--muted-foreground))'
                }} width={30} />
                <Tooltip formatter={value => [`${value}`, 'Assignments']} labelFormatter={label => `${label}`} contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} />
                <Legend wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px',
                  color: 'hsl(var(--foreground))'
                }} iconType="circle" />
                <Line type="monotone" dataKey="count" name="Assignments" stroke="#6366f1" strokeWidth={2.5} activeDot={{
                  r: 5,
                  fill: '#6366f1',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }} dot={{
                  r: 3,
                  fill: '#6366f1',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 1
                }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Monthly Completed Assignments</CardTitle>
        </CardHeader>
        <CardContent className="h-[450px] p-6">
          {isLoadingMonthlyData ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full px-8">
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-10 w-5/6 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : monthlyCompletionsData && monthlyCompletionsData.chartData && monthlyCompletionsData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCompletionsData.chartData} margin={{
            top: 40,
            right: 30,
            left: 20,
            bottom: 20
          }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{
              fontSize: 12,
              fill: '#64748b'
            }} />
                <YAxis axisLine={false} tickLine={false} tick={{
              fontSize: 12,
              fill: '#64748b'
            }} />
                <Tooltip formatter={(value, name) => [`${value} assignments`, 'Completed']} labelFormatter={label => `Month: ${label}`} contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px'
            }} />
                <Bar dataKey="total" fill={COLORS.total} radius={[6, 6, 0, 0]} shape={<RoundedBar />}>
                  <LabelList dataKey="total" position="top" style={{
                fill: '#1e293b',
                fontSize: '12px',
                fontWeight: '600'
              }} content={({
                x,
                y,
                width,
                value
              }) => {
                if (value === 0) return null;
                return <text x={Number(x) + Number(width) / 2} y={Number(y) - 8} textAnchor="middle" dominantBaseline="middle" style={{
                  fill: '#1e293b',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                          {value}
                        </text>;
              }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No monthly completed assignments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Top Photographers</CardTitle>
          <span className="text-sm text-muted-foreground">Ranked by completed assignments</span>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingTopPhotographers ? (
            <div className="flex items-center justify-center h-32">
              <div className="space-y-3 w-full">
                <div className="h-12 w-full bg-muted animate-pulse rounded" />
                <div className="h-12 w-full bg-muted animate-pulse rounded" />
                <div className="h-12 w-full bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : topPhotographersData && topPhotographersData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Photographer Name</TableHead>
                  <TableHead className="text-right">Completed Assignments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPhotographersData.map(photographer => <TableRow key={photographer.id} className="hover:bg-muted/50">
                    <TableCell className="text-center font-bold">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${photographer.rank === 1 ? 'bg-yellow-100 text-yellow-800' : photographer.rank === 2 ? 'bg-gray-100 text-gray-800' : photographer.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-700'}`}>
                        {photographer.rank}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{photographer.name}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-green-100 text-green-800 text-sm">
                        {photographer.completedCount}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No completed assignments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Category Distribution</CardTitle>
          <span className="text-sm text-muted-foreground">Assignments by category</span>
        </CardHeader>
        <CardContent className="h-[350px] p-6">
          {isLoadingCategoryData ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-48 h-48 bg-muted animate-pulse rounded-full" />
            </div>
          ) : categoryData && categoryData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No category data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>;
};