
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
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
    </div>
  );
};
