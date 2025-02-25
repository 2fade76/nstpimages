
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AnalyticsSection = () => {
  const { data: statusData } = useQuery({
    queryKey: ['assignments-by-status'],
    queryFn: async () => {
      const statuses = ['open', 'progress', 'hold', 'complete'];
      const statusCounts = await Promise.all(
        statuses.map(async (status) => {
          const { count } = await supabase
            .from('assignments')
            .select('*', { count: 'exact' })
            .eq('status', status);
          
          return {
            name: status === 'progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1),
            value: count || 0,
            color: {
              open: '#22C55E',
              progress: '#F59E0B',
              hold: '#EF4444',
              complete: '#6366F1'
            }[status]
          };
        })
      );
      return statusCounts;
    }
  });

  const { data: photographerData } = useQuery({
    queryKey: ['assignments-by-photographer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select(`
          name,
          assignments (count)
        `);
      
      if (error) throw error;
      
      return data.map(photographer => ({
        name: photographer.name,
        assignments: (photographer.assignments as any[]).length
      }));
    }
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Assignment Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {statusData?.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Assignments per Photographer</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={photographerData}>
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="assignments" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
