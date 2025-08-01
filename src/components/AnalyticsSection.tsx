import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, LabelList } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, parseISO, subMonths, startOfMonth, endOfMonth, getDaysInMonth, getDate, isValid } from "date-fns";
import { Assignment, Photographer } from "@/types/database";
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
export const AnalyticsSection = () => {
  const {
    data: monthlyData,
    isLoading
  } = useQuery({
    queryKey: ['assignments-this-month'],
    queryFn: async () => {
      const today = new Date();
      const startOfCurrentMonth = startOfMonth(today);
      const endOfCurrentMonth = endOfMonth(today);
      const daysInMonth = getDaysInMonth(today);
      const daysInCurrentMonth = Array.from({
        length: daysInMonth
      }, (_, i) => {
        const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
        return {
          date,
          formattedDate: format(date, 'MMM dd'),
          count: 0
        };
      });
      const {
        data,
        error
      } = await supabase.from('assignments').select('date').gte('date', startOfCurrentMonth.toISOString()).lte('date', endOfCurrentMonth.toISOString());
      if (error) throw error;
      if (data) {
        data.forEach(assignment => {
          const assignmentDate = new Date(assignment.date);
          if (isValid(assignmentDate)) {
            const dayOfMonth = getDate(assignmentDate) - 1;
            if (dayOfMonth >= 0 && dayOfMonth < daysInCurrentMonth.length) {
              daysInCurrentMonth[dayOfMonth].count += 1;
            }
          }
        });
      }
      return daysInCurrentMonth;
    },
    refetchInterval: 5000
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
    refetchInterval: 5000
  });
  const {
    data: monthlyCompletionsData,
    isLoading: isLoadingMonthlyData
  } = useQuery({
    queryKey: ['monthly-completions-total'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('assignments').select('date, status').eq('status', 'complete').order('date', {
        ascending: true
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          chartData: []
        };
      }

      // Group completed assignments by month
      const monthlyCounts: Record<string, number> = {};
      
      data.forEach(assignment => {
        if (assignment.status === 'complete') {
          const assignmentMonth = format(parseISO(assignment.date), 'MMM yyyy');
          if (!monthlyCounts[assignmentMonth]) {
            monthlyCounts[assignmentMonth] = 0;
          }
          monthlyCounts[assignmentMonth]++;
        }
      });

      // Create chart data format sorted by date
      const chartData = Object.entries(monthlyCounts)
        .map(([month, total]) => ({
          month,
          total
        }))
        .sort((a, b) => {
          // Parse the month strings for proper chronological sorting
          const dateA = new Date(`01 ${a.month}`);
          const dateB = new Date(`01 ${b.month}`);
          return dateA.getTime() - dateB.getTime();
        });

      return {
        chartData
      };
    },
    refetchInterval: 5000
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
  } = useQuery<TopPhotographer[]>({
    queryKey: ['top-photographers'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('assignments').select(`
          photographer_id,
          photographers (id, name)
        `).eq('status', 'complete');
      if (error) throw error;
      if (!data || data.length === 0) {
        return [];
      }

      // Count completions by photographer
      const photographerCounts: Record<string, {
        name: string;
        count: number;
        id: string;
      }> = {};
      (data as AssignmentWithPhotographer[]).forEach(assignment => {
        const photographerId = assignment.photographer_id;
        const photographerName = assignment.photographers?.name || 'Unknown';
        const photographerDbId = assignment.photographers?.id || photographerId;
        if (!photographerCounts[photographerId]) {
          photographerCounts[photographerId] = {
            id: photographerDbId,
            name: photographerName,
            count: 0
          };
        }
        photographerCounts[photographerId].count += 1;
      });

      // Convert to array and sort
      const sortedPhotographers = Object.values(photographerCounts).sort((a, b) => b.count - a.count).slice(0, 10) // Top 10
      .map((photographer, index) => ({
        id: photographer.id,
        name: photographer.name,
        completedCount: photographer.count,
        rank: index + 1
      }));
      return sortedPhotographers;
    },
    refetchInterval: 5000
  });
  return <div className="grid gap-6">
      <Card className="shadow-sm border-gray-100 dark:border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-gray-800 dark:text-gray-200">Assignments Volume - This Month</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] p-4">
          {isLoading ? <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading data...</p>
            </div> : <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{
            top: 20,
            right: 20,
            left: 10,
            bottom: 40
          }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" strokeOpacity={0.6} className="dark:stroke-gray-700" />
                <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{
              fontSize: 11,
              fill: 'hsl(var(--muted-foreground))'
            }} interval="preserveStartEnd" />
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
            </ResponsiveContainer>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Monthly Completed Assignments</CardTitle>
        </CardHeader>
        <CardContent className="h-[450px] p-6">
          {isLoadingMonthlyData ? <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading monthly data...</p>
            </div> : monthlyCompletionsData && monthlyCompletionsData.chartData && monthlyCompletionsData.chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer> : <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No monthly completed assignments found</p>
            </div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Top Photographers</CardTitle>
          <span className="text-sm text-muted-foreground">Ranked by completed assignments</span>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingTopPhotographers ? <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading top photographers...</p>
            </div> : topPhotographersData && topPhotographersData.length > 0 ? <Table>
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
                  </TableRow>)}
              </TableBody>
            </Table> : <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No completed assignments found</p>
            </div>}
        </CardContent>
      </Card>
    </div>;
};