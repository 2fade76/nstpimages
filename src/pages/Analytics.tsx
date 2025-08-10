import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { AnalyticsSummaryCard } from "@/components/AnalyticsSummaryCard";

const Analytics = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Force fresh data whenever Analytics page is opened
    queryClient.refetchQueries({ queryKey: ['assignments-this-month'] });
    queryClient.refetchQueries({ queryKey: ['completed-assignments-by-date'] });
    queryClient.refetchQueries({ queryKey: ['monthly-completions-total'] });
    queryClient.refetchQueries({ queryKey: ['top-photographers'] });
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
