import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DashboardStatsCardsProps {
  onFilterChange?: (filter: 'all' | 'open' | 'complete' | 'today-complete') => void;
  activeFilter?: 'all' | 'open' | 'complete' | 'today-complete';
}

interface DashboardTrends {
  current: {
    total: number;
    open: number;
    completed: number;
    todayCompleted: number;
  };
  yesterday: {
    total: number;
    open: number;
    completed: number;
    todayCompleted: number;
  };
}

export const DashboardStatsCards = ({
  onFilterChange,
  activeFilter
}: DashboardStatsCardsProps) => {
  const { data: trends, isLoading } = useQuery<DashboardTrends>({
    queryKey: ['dashboard-trends'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_trends');
      if (error) throw error;
      return data as unknown as DashboardTrends;
    },
    staleTime: 60000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  // Get total photographers count
  const { data: photographersCount } = useQuery({
    queryKey: ['photographers-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('photographers')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000
  });

  const getTrendData = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = previous > 0 ? ((change / previous) * 100) : 0;
    return {
      change,
      percentage: Math.abs(percentage),
      isPositive: change >= 0
    };
  };

  const totalTrend = getTrendData(
    trends?.current.total || 0, 
    trends?.yesterday.total || 0
  );
  const completedTrend = getTrendData(
    trends?.current.completed || 0, 
    trends?.yesterday.completed || 0
  );

  const handleCardClick = (filter: 'all' | 'open' | 'complete' | 'today-complete') => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Assignments */}
      <button
        onClick={() => handleCardClick('all')}
        className={`text-left transition-all duration-200 ${
          activeFilter === 'all' ? 'ring-2 ring-primary/50' : ''
        }`}
      >
        <Card className="border-border/40 bg-gradient-to-br from-stat-total/10 to-stat-total/5 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Assignments</p>
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-stat-total">{trends?.current.total || 0}</span>
                <span className="text-xs text-muted-foreground">This Year</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-2">
              {totalTrend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-rose-500" />
              )}
              <span className={`text-xs font-medium ${totalTrend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalTrend.percentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Completed This Month */}
      <button
        onClick={() => handleCardClick('complete')}
        className={`text-left transition-all duration-200 ${
          activeFilter === 'complete' ? 'ring-2 ring-primary/50' : ''
        }`}
      >
        <Card className="border-border/40 bg-gradient-to-br from-stat-complete/10 to-stat-complete/5 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Assignment Completed</p>
            {isLoading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-stat-complete">{trends?.current.completed || 0}</span>
                <span className="text-xs text-muted-foreground">This Month</span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-2">
              {completedTrend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-rose-500" />
              )}
              <span className={`text-xs font-medium ${completedTrend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {completedTrend.percentage.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Team */}
      <Card className="border-border/40 bg-gradient-to-br from-stat-team/10 to-stat-team/5">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Team</p>
          {isLoading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-stat-team">{photographersCount || 0}</span>
              <div className="text-xs text-muted-foreground">
                <p>Staff</p>
                <p>Photographers</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
