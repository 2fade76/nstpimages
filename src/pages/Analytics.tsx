
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { AnalyticsSummaryCard } from "@/components/AnalyticsSummaryCard";

const Analytics = () => {
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
