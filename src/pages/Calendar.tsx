
import { DashboardLayout } from "@/components/DashboardLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment } from "@/types/database";
import { format } from "date-fns";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
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
      
      if (error) throw error;
      return data as (Assignment & { photographers: { id: string; name: string } })[];
    },
  });

  // Format assignments for the selected date
  const selectedDateAssignments = assignments?.filter((assignment) => {
    if (!date) return false;
    
    // Convert assignment.date string to Date object for comparison
    // Format could be MM/DD/YYYY or similar, adjust accordingly
    const assignmentDate = new Date(assignment.date);
    return (
      assignmentDate.getDate() === date.getDate() &&
      assignmentDate.getMonth() === date.getMonth() &&
      assignmentDate.getFullYear() === date.getFullYear()
    );
  });

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
                                : assignment.status === "progress"
                                ? "bg-status-progress"
                                : assignment.status === "hold"
                                ? "bg-status-hold"
                                : "bg-status-complete"
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
