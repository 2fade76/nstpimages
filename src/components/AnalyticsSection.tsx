import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      const today = new Date();
      const monthsToShow = 6;
      const startDate = startOfMonth(subMonths(today, monthsToShow - 1));
      const endDate = endOfMonth(today);
      
      const {
        data,
        error
      } = await supabase.from('assignments')
        .select('date, status')
        .eq('status', 'complete')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          chartData: [],
        };
      }
      
      const months = Array.from({
        length: monthsToShow
      }, (_, i) => {
        const monthDate = subMonths(today, monthsToShow - 1 - i);
        return format(monthDate, 'MMM yyyy');
      });
      
      // Initialize monthly counts with zeros
      const monthlyCounts = months.reduce<Record<string, number>>((acc, month) => {
        acc[month] = 0;
        return acc;
      }, {});
      
      // Count completed assignments by month
      data.forEach(assignment => {
        if (assignment.status === 'complete') {
          const assignmentMonth = format(parseISO(assignment.date), 'MMM yyyy');
          if (months.includes(assignmentMonth)) {
            monthlyCounts[assignmentMonth]++;
          }
        }
      });
      
      // Create chart data format
      const chartData = months.map(month => {
        return {
          month,
          total: monthlyCounts[month]
        };
      });
      
      return {
        chartData
      };
    },
    refetchInterval: 5000
  });
  const COLORS = {
    total: '#9b87f5',
    open: '#f97316',
    progress: '#3b82f6',
    complete: '#4ade80',
    cancel: '#ef4444'
  };
  const getColor = (index: number) => {
    const colorPalette = ['#4ade80', '#3b82f6', '#f97316', '#ef4444', '#9b87f5', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4'];
    return colorPalette[index % colorPalette.length];
  };
  return <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-slate-950">
          <CardTitle>Assignments Volume- This Month</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoading ? <div className="flex items-center justify-center h-full">
              <p>Loading data...</p>
            </div> : <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 30
          }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8E9196" strokeOpacity={0.2} />
                <XAxis dataKey="formattedDate" label={{
              value: 'Date',
              position: 'insideBottom',
              offset: -20
            }} />
                <YAxis label={{
              value: 'Assignments',
              angle: -90,
              position: 'insideLeft',
              offset: -5
            }} />
                <Tooltip formatter={value => [`${value} assignments`, 'Count']} labelFormatter={label => `Date: ${label}`} />
                <Legend />
                <Line type="monotone" dataKey="count" name="Assignments" stroke={COLORS.total} strokeWidth={2} activeDot={{
              r: 8
            }} />
              </LineChart>
            </ResponsiveContainer>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-slate-950">
          <CardTitle>Monthly Completed Assignments - Total</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoadingMonthlyData ? <div className="flex items-center justify-center h-full">
              <p>Loading monthly data...</p>
            </div> : monthlyCompletionsData && monthlyCompletionsData.chartData && monthlyCompletionsData.chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCompletionsData.chartData} margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 30
          }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8E9196" strokeOpacity={0.2} />
                <XAxis dataKey="month" label={{
              value: 'Month',
              position: 'insideBottom',
              offset: -20
            }} />
                <YAxis label={{
              value: 'Completed Assignments',
              angle: -90,
              position: 'insideLeft',
              offset: -5
            }} />
                <Tooltip formatter={(value, name) => [`${value} assignments`, name]} labelFormatter={label => `Month: ${label}`} />
                <Legend />
                <Bar dataKey="total" name="Total Completions" fill={COLORS.total} stackId="a">
                  <LabelList dataKey="total" position="top" content={({
                x,
                y,
                width,
                height,
                value
              }) => {
                return <g>
                          <text x={Number(x) + Number(width) / 2} y={Number(y) - 10} fill="#000000" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                            {value}
                          </text>
                        </g>;
              }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer> : <div className="flex items-center justify-center h-full">
              <p>No monthly completed assignments found</p>
            </div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Completed Assignments Over Time by Photographer</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoadingCompletedData ? <div className="flex items-center justify-center h-full">
              <p>Loading data...</p>
            </div> : completedAssignmentsData && completedAssignmentsData.chartData && completedAssignmentsData.chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completedAssignmentsData.chartData} margin={{
            top: 10,
            right: 30,
            left: 10,
            bottom: 30
          }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#8E9196" strokeOpacity={0.2} />
                <XAxis dataKey="date" label={{
              value: 'Date',
              position: 'insideBottom',
              offset: -20
            }} />
                <YAxis label={{
              value: 'Completed Assignments',
              angle: -90,
              position: 'insideLeft',
              offset: -5
            }} />
                <Tooltip />
                <Legend />
                {completedAssignmentsData.photographers.map((photographer, index) => <Line key={photographer} type="monotone" dataKey={photographer} name={photographer} stroke={getColor(index)} strokeWidth={2} activeDot={{
              r: 6
            }} />)}
              </LineChart>
            </ResponsiveContainer> : <div className="flex items-center justify-center h-full">
              <p>No completed assignments found</p>
            </div>}
        </CardContent>
      </Card>
    </div>;
};
