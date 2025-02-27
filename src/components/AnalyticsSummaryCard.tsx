
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock } from "lucide-react";

export const AnalyticsSummaryCard = () => {
  const { data: totalAssignments, isLoading: loadingTotal } = useQuery({
    queryKey: ['total-assignments'],
    queryFn: async () => {
      const { count } = await supabase
        .from('assignments')
        .select('*', { count: 'exact' });
      return count || 0;
    },
  });

  const { data: openAssignments, isLoading: loadingOpen } = useQuery({
    queryKey: ['open-assignments'],
    queryFn: async () => {
      const { count } = await supabase
        .from('assignments')
        .select('*', { count: 'exact' })
        .eq('status', 'open');
      return count || 0;
    },
  });

  const { data: completedAssignments, isLoading: loadingCompleted } = useQuery({
    queryKey: ['completed-assignments'],
    queryFn: async () => {
      const { count } = await supabase
        .from('assignments')
        .select('*', { count: 'exact' })
        .eq('status', 'complete');
      return count || 0;
    },
  });

  const isLoading = loadingTotal || loadingOpen || loadingCompleted;

  return (
    <Card className="mb-6 bg-gradient-to-br from-card to-secondary/80">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center mb-2 text-purple-500">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Assignments</p>
            {isLoading ? (
              <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-purple-700">{totalAssignments}</p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center mb-2 text-orange-500">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Open Assignments</p>
            {isLoading ? (
              <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-orange-500">{openAssignments}</p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center mb-2 text-green-500">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Completed</p>
            {isLoading ? (
              <div className="h-8 w-12 bg-slate-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-green-600">{completedAssignments}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
