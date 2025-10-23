import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { AnalyticsSummaryCard } from "@/components/AnalyticsSummaryCard";

const Analytics = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate and refetch all analytics queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['assignments-this-month'] });
    queryClient.invalidateQueries({ queryKey: ['completed-assignments-by-date'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-completions-total'] });
    queryClient.invalidateQueries({ queryKey: ['top-photographers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-trends'] });
  }, [queryClient]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Analytics Dashboard
          </h1>
        </div>
        
        <AnalyticsSummaryCard />
        
        <AnalyticsSection />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
