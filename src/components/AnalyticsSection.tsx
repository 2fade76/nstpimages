
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
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const AnalyticsSection = () => {
  // Weekly assignments query - existing functionality
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

  // Query for photographer performance (completed assignments per photographer)
  const { data: photographerData, isLoading: isLoadingPhotographers } = useQuery({
    queryKey: ['photographer-completed-assignments'],
    queryFn: async () => {
      // Get all completed assignments with photographer info
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          photographer_id,
          photographers (name)
        `)
        .eq('status', 'complete');
      
      if (error) throw error;
      
      // Group by photographer and count
      const photographerStats: Record<string, { name: string, count: number }> = {};
      
      if (data) {
        data.forEach(assignment => {
          const photographerId = assignment.photographer_id;
          const photographerName = assignment.photographers?.name || 'Unknown';
          
          if (!photographerStats[photographerId]) {
            photographerStats[photographerId] = {
              name: photographerName,
              count: 0
            };
          }
          
          photographerStats[photographerId].count++;
        });
      }
      
      // Convert to array for recharts
      const chartData = Object.values(photographerStats)
        .sort((a, b) => b.count - a.count) // Sort by count (highest first)
        .slice(0, 5); // Only show top 5 photographers
      
      return chartData;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get total completed assignments
  const totalCompleted = photographerData?.reduce((total, item) => total + item.count, 0) || 0;

  // Color constants to match the status colors used in the app
  const COLORS = {
    total: '#9b87f5', // Purple for total
    open: '#f97316', // Orange for open
    progress: '#3b82f6', // Blue for in progress
    complete: '#4ade80', // Green for completed
    cancel: '#ef4444' // Red for cancelled
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#8E9196" strokeOpacity={0.2} />
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
                  stroke={COLORS.total} 
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
          <CardTitle>Top Photographers by Completed Assignments</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoadingPhotographers ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading data...</p>
            </div>
          ) : photographerData && photographerData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={photographerData}
                margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#8E9196" strokeOpacity={0.2} />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} completed assignments`, 'Count']}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Completed Assignments" 
                  fill={COLORS.complete}
                  radius={[0, 4, 4, 0]} // Rounded right corners
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
