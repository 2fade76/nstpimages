import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsSummaryCardProps {
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

export const AnalyticsSummaryCard = ({
  onFilterChange,
  activeFilter
}: AnalyticsSummaryCardProps) => {
  // Single optimized query using database function
  const { data: trends, isLoading } = useQuery<DashboardTrends>({
    queryKey: ['dashboard-trends'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_trends');
      
      if (error) throw error;
      // Parse the JSONB response from the database function
      return data as unknown as DashboardTrends;
    },
    staleTime: 60000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  // Trend calculations
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
  const openTrend = getTrendData(
    trends?.current.open || 0, 
    trends?.yesterday.open || 0
  );
  const completedTrend = getTrendData(
    trends?.current.completed || 0, 
    trends?.yesterday.completed || 0
  );
  const todayTrend = getTrendData(
    trends?.current.todayCompleted || 0, 
    trends?.yesterday.todayCompleted || 0
  );

  const handleCardClick = (filter: 'all' | 'open' | 'complete' | 'today-complete') => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <Card className="mb-4 md:mb-6 bg-gradient-to-br from-card to-secondary/10">
      <CardContent className="p-3 md:p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {/* Total Assignments Card */}
          <button
            className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 border border-orange-200 shadow-sm transition-all duration-200 min-h-[100px] md:min-h-[120px] ${
              activeFilter === 'all' 
                ? 'ring-2 ring-orange-400 bg-orange-100' 
                : 'hover:shadow-md hover:scale-105 active:scale-95'
            }`}
            onClick={() => handleCardClick('all')}
            aria-label="View all assignments"
          >
            <div className="flex items-center justify-center mb-1 md:mb-2 text-stat-total">
              <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1 text-center leading-tight">Total Assignments</p>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <p className="text-xl md:text-3xl font-bold text-stat-total">{trends?.current.total}</p>
                <div className="flex items-center gap-1 mt-1">
                  {totalTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${totalTrend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {totalTrend.percentage.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </button>

          {/* Open Assignments Card */}
          <button
            className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-lg bg-gradient-to-b from-green-50 to-green-100 border border-green-200 shadow-sm transition-all duration-200 min-h-[100px] md:min-h-[120px] ${
              activeFilter === 'open' 
                ? 'ring-2 ring-green-400 bg-green-100' 
                : 'hover:shadow-md hover:scale-105 active:scale-95'
            }`}
            onClick={() => handleCardClick('open')}
            aria-label="View open assignments"
          >
            <div className="flex items-center justify-center mb-1 md:mb-2 text-status-open">
              <Clock className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1 text-center">Open</p>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <p className="text-xl md:text-3xl font-bold text-status-open">{trends?.current.open}</p>
                <div className="flex items-center gap-1 mt-1">
                  {openTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${openTrend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {openTrend.percentage.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </button>

          {/* Completed Assignments Card */}
          <button
            className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-lg bg-gradient-to-b from-purple-50 to-purple-100 border border-purple-200 shadow-sm transition-all duration-200 min-h-[100px] md:min-h-[120px] ${
              activeFilter === 'complete' 
                ? 'ring-2 ring-purple-400 bg-purple-100' 
                : 'hover:shadow-md hover:scale-105 active:scale-95'
            }`}
            onClick={() => handleCardClick('complete')}
            aria-label="View completed assignments"
          >
            <div className="flex items-center justify-center mb-1 md:mb-2 text-status-complete">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1 text-center">Completed</p>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <p className="text-xl md:text-3xl font-bold text-status-complete">{trends?.current.completed}</p>
                <div className="flex items-center gap-1 mt-1">
                  {completedTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${completedTrend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {completedTrend.percentage.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </button>

          {/* Today's Completed Card */}
          <button
            className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 shadow-sm transition-all duration-200 min-h-[100px] md:min-h-[120px] ${
              activeFilter === 'today-complete' 
                ? 'ring-2 ring-blue-400 bg-blue-100' 
                : 'hover:shadow-md hover:scale-105 active:scale-95'
            }`}
            onClick={() => handleCardClick('today-complete')}
            aria-label="View today's completed assignments"
          >
            <div className="flex items-center justify-center mb-1 md:mb-2 text-blue-500">
              <BarChart2 className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <p className="text-muted-foreground mb-1 text-[10px] md:text-xs text-center leading-tight font-bold">Today's Completed</p>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <p className="text-xl font-bold text-blue-500 md:text-4xl">{trends?.current.todayCompleted}</p>
                <div className="flex items-center gap-1 mt-1">
                  {todayTrend.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${todayTrend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {todayTrend.percentage.toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
