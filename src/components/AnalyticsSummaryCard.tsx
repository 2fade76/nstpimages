import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, BarChart2 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
export const AnalyticsSummaryCard = () => {
  const {
    data: totalAssignments,
    isLoading: loadingTotal
  } = useQuery({
    queryKey: ['total-assignments'],
    queryFn: async () => {
      const {
        count
      } = await supabase.from('assignments').select('*', {
        count: 'exact'
      });
      return count || 0;
    }
  });
  const {
    data: openAssignments,
    isLoading: loadingOpen
  } = useQuery({
    queryKey: ['open-assignments'],
    queryFn: async () => {
      const {
        count
      } = await supabase.from('assignments').select('*', {
        count: 'exact'
      }).eq('status', 'open');
      return count || 0;
    }
  });
  const {
    data: completedAssignments,
    isLoading: loadingCompleted
  } = useQuery({
    queryKey: ['completed-assignments'],
    queryFn: async () => {
      const {
        count
      } = await supabase.from('assignments').select('*', {
        count: 'exact'
      }).eq('status', 'complete');
      return count || 0;
    }
  });

  // Updated query for today's completed assignments instead of average
  const {
    data: todayCompletedAssignments,
    isLoading: loadingToday
  } = useQuery({
    queryKey: ['today-completed-assignments'],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();
      const {
        count
      } = await supabase.from('assignments').select('*', {
        count: 'exact'
      }).gte('date', startOfToday).lte('date', endOfToday).eq('status', 'complete');
      return count || 0;
    }
  });
  const isLoading = loadingTotal || loadingOpen || loadingCompleted || loadingToday;
  const currentDate = format(new Date(), 'MMMM d, yyyy');
  return <Card className="mb-6 bg-gradient-to-br from-card to-secondary/10">
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Total Assignments Card */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-b from-red-50 to-red-100 border border-red-200 shadow-sm">
            <div className="flex items-center justify-center mb-2 text-red-500">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Assignments</p>
            {isLoading ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div> : <>
                <p className="text-3xl font-bold text-[#ea384c]">{totalAssignments}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentDate}</p>
              </>}
          </div>

          {/* Open Assignments Card */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-b from-green-50 to-green-100 border border-green-200 shadow-sm">
            <div className="flex items-center justify-center mb-2 text-status-open">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Open </p>
            {isLoading ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div> : <>
                <p className="text-3xl font-bold text-status-open">{openAssignments}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentDate}</p>
              </>}
          </div>

          {/* Completed Assignments Card */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-b from-indigo-50 to-indigo-100 border border-indigo-200 shadow-sm">
            <div className="flex items-center justify-center mb-2 text-status-complete">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            {isLoading ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div> : <>
                <p className="text-3xl font-bold text-status-complete">{completedAssignments}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentDate}</p>
              </>}
          </div>

          {/* Today's Completed Card - Changed from Today's Average */}
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-center mb-2 text-blue-500">
              <BarChart2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Today's Completed</p>
            {isLoading ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div> : <>
                <p className="text-3xl font-bold text-blue-500">{todayCompletedAssignments}</p>
                <p className="text-xs text-muted-foreground mt-1">{currentDate}</p>
              </>}
          </div>
        </div>
      </CardContent>
    </Card>;
};