import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

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

  const StatSkeleton = () => (
    <Card className="rounded-2xl border-border/30">
      <CardContent className="p-5">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-10 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Assignments - Highlighted card */}
      <button
        onClick={() => handleCardClick('all')}
        className={`text-left transition-all duration-200 rounded-2xl ${
          activeFilter === 'all' ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background' : ''
        }`}
      >
        <Card className="rounded-2xl border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/20 h-full">
          <CardContent className="p-5 relative">
            <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium opacity-90 mb-1">Total Assignments</p>
            <span className="text-4xl font-bold block mb-2">{trends?.current.total || 0}</span>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              {totalTrend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>{totalTrend.percentage.toFixed(1)}% from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Completed This Month */}
      <button
        onClick={() => handleCardClick('complete')}
        className={`text-left transition-all duration-200 rounded-2xl ${
          activeFilter === 'complete' ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background' : ''
        }`}
      >
        <Card className="rounded-2xl border-border/30 bg-card hover:shadow-md transition-shadow h-full">
          <CardContent className="p-5 relative">
            <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
            <span className="text-4xl font-bold text-foreground block mb-2">{trends?.current.completed || 0}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {completedTrend.isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span>{completedTrend.percentage.toFixed(1)}% from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Open Assignments */}
      <button
        onClick={() => handleCardClick('open')}
        className={`text-left transition-all duration-200 rounded-2xl ${
          activeFilter === 'open' ? 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background' : ''
        }`}
      >
        <Card className="rounded-2xl border-border/30 bg-card hover:shadow-md transition-shadow h-full">
          <CardContent className="p-5 relative">
            <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Open</p>
            <span className="text-4xl font-bold text-foreground block mb-2">{trends?.current.open || 0}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>Active assignments</span>
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Team */}
      <Card className="rounded-2xl border-border/30 bg-card h-full">
        <CardContent className="p-5 relative">
          <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Team</p>
          <span className="text-4xl font-bold text-foreground block mb-2">{photographersCount || 0}</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Staff Photographers</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
