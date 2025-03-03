
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";

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

  // Query for completed assignments over time by photographer
  const { data: completedAssignmentsData, isLoading: isLoadingCompletedData } = useQuery({
    queryKey: ['completed-assignments-by-date'],
    queryFn: async () => {
      // Get all completed assignments with date and photographer info
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          date,
          photographer_id,
          photographers (name)
        `)
        .eq('status', 'complete')
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Group by date and then by photographer
      const groupedByDate = data.reduce((acc, assignment) => {
        const dateString = format(parseISO(assignment.date), 'MMM dd');
        const photographerName = assignment.photographers?.name || 'Unknown';
        
        if (!acc[dateString]) {
          acc[dateString] = {
            date: dateString,
            photographers: {}
          };
        }
        
        if (!acc[dateString].photographers[photographerName]) {
          acc[dateString].photographers[photographerName] = 0;
        }
        
        acc[dateString].photographers[photographerName] += 1;
        return acc;
      }, {});
      
      // Convert to array and flatten photographer data
      const uniquePhotographers = new Set();
      data.forEach(assignment => {
        uniquePhotographers.add(assignment.photographers?.name || 'Unknown');
      });
      
      // Convert to array format for recharts
      const chartData = Object.values(groupedByDate).map(item => {
        const dateData = { date: item.date };
        
        // Add count for each photographer
        Array.from(uniquePhotographers).forEach(photographer => {
          dateData[photographer] = item.photographers[photographer] || 0;
        });
        
        return dateData;
      });
      
      // Sort by date
      chartData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      
      return {
        chartData,
        photographers: Array.from(uniquePhotographers)
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Color constants to match the status colors used in the app
  const COLORS = {
    total: '#9b87f5', // Purple for total
    open: '#f97316', // Orange for open
    progress: '#3b82f6', // Blue for in progress
    complete: '#4ade80', // Green for completed
    cancel: '#ef4444' // Red for cancelled
  };

  // Generate random colors for photographers
  const getColor = (index) => {
    const colorPalette = [
      '#4ade80', // Green
      '#3b82f6', // Blue
      '#f97316', // Orange
      '#ef4444', // Red
      '#9b87f5', // Purple
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#f59e0b', // Amber
      '#8b5cf6', // Violet
      '#06b6d4'  // Cyan
    ];
    
    return colorPalette[index % colorPalette.length];
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
          <CardTitle>Completed Assignments Over Time by Photographer</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoadingCompletedData ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading data...</p>
            </div>
          ) : completedAssignmentsData && completedAssignmentsData.chartData && completedAssignmentsData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={completedAssignmentsData.chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#8E9196" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  label={{ 
                    value: 'Date', 
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
                <Tooltip />
                <Legend />
                {completedAssignmentsData.photographers.map((photographer, index) => (
                  <Line 
                    key={photographer}
                    type="monotone" 
                    dataKey={photographer} 
                    name={photographer}
                    stroke={getColor(index)}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
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
