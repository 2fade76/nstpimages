
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const AnalyticsSection = () => {
  const { data: weeklyData, isLoading } = useQuery({
    queryKey: ['assignments-last-7-days'],
    queryFn: async () => {
      // Generate dates for the last 7 days
      const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i); // Start from 6 days ago
        return {
          date,
          formattedDate: format(date, 'MMM dd'),
          count: 0
        };
      });
      
      // Get all assignments from the last 7 days
      const sevenDaysAgo = subDays(new Date(), 6);
      const { data, error } = await supabase
        .from('assignments')
        .select('date')
        .gte('date', startOfDay(sevenDaysAgo).toISOString())
        .lte('date', endOfDay(new Date()).toISOString());
      
      if (error) throw error;
      
      // Count assignments for each day
      if (data) {
        data.forEach(assignment => {
          const assignmentDate = new Date(assignment.date);
          const dayIndex = lastSevenDays.findIndex(day => 
            assignmentDate.getDate() === day.date.getDate() && 
            assignmentDate.getMonth() === day.date.getMonth() && 
            assignmentDate.getFullYear() === day.date.getFullYear()
          );
          
          if (dayIndex !== -1) {
            lastSevenDays[dayIndex].count += 1;
          }
        });
      }
      
      return lastSevenDays;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Query for completed assignments count by month
  const { data: completedAssignments, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['completed-assignments'],
    queryFn: async () => {
      // Get all completed assignments
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('status', 'complete');
      
      if (error) throw error;
      
      // Group assignments by month
      const monthlyData: Record<string, number> = {};
      
      if (data) {
        data.forEach(assignment => {
          const date = new Date(assignment.date);
          const monthKey = format(date, 'MMM yyyy');
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          
          monthlyData[monthKey]++;
        });
      }
      
      // Convert to array format for recharts
      const chartData = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      }));
      
      // Sort by month chronologically
      chartData.sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
      
      return chartData;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get total completed assignments
  const totalCompleted = completedAssignments?.reduce((total, item) => total + item.count, 0) || 0;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignments - Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  label={{ 
                    value: 'Date', 
                    position: 'insideBottom', 
                    offset: -20 
                  }}
                />
                <YAxis 
                  label={{ 
                    value: 'Assignments', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -5
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} assignments`, 'Count']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Assignments" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Completed Assignments</CardTitle>
          <div className="text-2xl font-bold">{totalCompleted}</div>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoadingCompleted ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading data...</p>
            </div>
          ) : completedAssignments && completedAssignments.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={completedAssignments}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ 
                    value: 'Month', 
                    position: 'insideBottom', 
                    offset: -20 
                  }}
                />
                <YAxis 
                  label={{ 
                    value: 'Completed Assignments', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: -5
                  }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} completed`, 'Count']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Completed Assignments" 
                  fill="#4ade80" // Green color for completed
                  radius={[4, 4, 0, 0]} // Rounded top corners
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No completed assignments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
