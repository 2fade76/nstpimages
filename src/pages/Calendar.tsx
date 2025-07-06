
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment } from "@/types/database";
import { format, isSameDay, parseISO } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      console.log('Fetching assignments for calendar view');
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          photographers (
            id,
            name
          )
        `)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }
      console.log('Fetched assignments:', data);
      return data as (Assignment & { photographers: { id: string; name: string } })[];
    },
  });

  useEffect(() => {
    console.log('Setting up real-time subscription for calendar');
    const channel = supabase
      .channel('calendar-assignments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assignments',
      }, (payload) => {
        console.log('Calendar received real-time update:', payload);
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.refetchQueries({ queryKey: ['assignments'] });
      })
      .subscribe();

    console.log('Calendar subscription activated');

    return () => {
      console.log('Cleaning up calendar subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const selectedDateAssignments = assignments?.filter((assignment) => {
    if (!date) return false;
    
    // Parse the assignment date string (YYYY-MM-DD) and compare using date-fns
    const assignmentDate = parseISO(assignment.date);
    const isMatch = isSameDay(assignmentDate, date);
    
    console.log(`Comparing assignment ${assignment.title} (${assignment.date}) with selected date (${format(date, 'yyyy-MM-dd')}): ${isMatch}`);
    
    return isMatch;
  });

  console.log('Selected date:', date ? format(date, 'yyyy-MM-dd') : 'none');
  console.log('Total assignments:', assignments?.length || 0);
  console.log('Filtered assignments for selected date:', selectedDateAssignments?.length || 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Assignment Calendar
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {date ? format(date, "MMMM d, yyyy") : "No date selected"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading assignments...</div>
              ) : selectedDateAssignments && selectedDateAssignments.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors"
                    >
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Location: {assignment.location}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Photographer: {assignment.photographers.name}
                      </div>
                      <div className="text-sm">
                        <span
                          className={`inline-block h-2 w-2 rounded-full mr-2 
                            ${
                              assignment.status === "open"
                                ? "bg-status-open"
                                : assignment.status === "complete"
                                ? "bg-status-complete"
                                : "bg-status-hold"
                            }`}
                        ></span>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No assignments scheduled for this date.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
