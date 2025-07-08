
import { DashboardLayout } from "@/components/DashboardLayout";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportContent } from "@/components/reports/ReportContent";
import { ReportExport } from "@/components/reports/ReportExport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportData } from "@/hooks/useReportData";
import { useState } from "react";

export interface ReportFilters {
  photographerIds: string[];
  assignmentStatuses: string[];
  cameraModels: string[];
  includeAssignmentDetails: boolean;
  dateRange: {
    from?: Date;
    to?: Date;
  };
}

const Reports = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    photographerIds: [],
    assignmentStatuses: [],
    cameraModels: [],
    includeAssignmentDetails: false,
    dateRange: {}
  });

  const { reportData, isLoading } = useReportData(filters);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Reports
          </h1>
          <ReportExport reportData={reportData} filters={filters} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Report Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportContent 
                reportData={reportData} 
                isLoading={isLoading}
                filters={filters}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
