
import { DashboardLayout } from "@/components/DashboardLayout";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportContent } from "@/components/reports/ReportContent";
import { ReportExport } from "@/components/reports/ReportExport";
import { ActiveFilters } from "@/components/reports/ActiveFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useReportData } from "@/hooks/useReportData";
import { useState } from "react";
import { Filter } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ReportFilters {
  reportScope: 'both' | 'assignments' | 'cameras' | 'photographer-profile' | 'photo-asset';
  photographerId?: string;
  assignmentStatuses: string[];
  cameraModels: string[];
  includeAssignmentDetails: boolean;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  profileYear?: number;
  completedYears: number[];
}

const Reports = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    reportScope: 'both',
    photographerId: undefined,
    assignmentStatuses: [],
    cameraModels: [],
    includeAssignmentDetails: false,
    dateRange: {},
    profileYear: new Date().getFullYear(),
    completedYears: []
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const { reportData, isLoading } = useReportData(filters);

  const clearFilters = () => {
    setFilters({
      reportScope: 'both',
      photographerId: undefined,
      assignmentStatuses: [],
      cameraModels: [],
      includeAssignmentDetails: false,
      dateRange: {},
      profileYear: new Date().getFullYear(),
      completedYears: []
    });
  };

  const FiltersPanel = (
    <ReportFilters 
      filters={filters} 
      onFiltersChange={setFilters} 
    />
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold tracking-tight">
            Reports
          </h1>
          <div className="flex gap-2 items-center">
            {isMobile && (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="no-print">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Report Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {FiltersPanel}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <ReportExport reportData={reportData} filters={filters} isLoading={isLoading} />
          </div>
        </div>

        <ActiveFilters filters={filters} onClearFilters={clearFilters} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {!isMobile && (
            <Card className="lg:col-span-1 filter-panel no-print">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                {FiltersPanel}
              </CardContent>
            </Card>
          )}

          <Card className={isMobile ? "lg:col-span-4" : "lg:col-span-3"}>
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
