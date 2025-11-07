import { ReportFilters } from "@/pages/Reports";
import { SummaryCards } from "./SummaryCards";
import { PhotographerSummaryTable } from "./PhotographerSummaryTable";
import { CameraEquipmentTable } from "./CameraEquipmentTable";
import { CameraModelStats } from "./CameraModelStats";
import { AssignmentDetailsTable } from "./AssignmentDetailsTable";
import { 
  SummaryCardsSkeleton, 
  PhotographerTableSkeleton, 
  CameraStatsGridSkeleton, 
  EquipmentTableSkeleton 
} from "./ReportSkeletons";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

interface ReportData {
  photographers: Array<{
    id: string;
    name: string;
    assignmentCount: number;
    completedAssignments: number;
    openAssignments: number;
    cancelledAssignments: number;
    cameraSets: Array<{
      id: string;
      camera_body_model: string;
      status: string;
    }>;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    location: string;
    date: string;
    status: string;
    photographer_name: string;
  }>;
  cameraSets: Array<{
    id: string;
    camera_body_model: string;
    camera_body_serial: string;
    lens_16_35_serial: string;
    lens_24_105_serial: string;
    lens_70_200_serial: string;
    battery_grip_serial: string;
    flash_serial: string;
    adapter_serial: string;
    camera_year_make: string;
    lens_16_35_year_make: string;
    lens_70_200_year_make: string;
    battery_grip_year_make: string;
    flash_year_make: string;
    adapter_year_make: string;
    photographer_name: string;
    status: string;
    ownership: 'loan' | 'own';
    date_received: string;
    notes: string;
  }>;
  summary: {
    totalPhotographers: number;
    totalAssignments: number;
    totalCameraSets: number;
    loanSets: number;
    ownSets: number;
    completedAssignments: number;
    openAssignments: number;
    cancelledAssignments: number;
  };
}

interface ReportContentProps {
  reportData: ReportData | undefined;
  isLoading: boolean;
  filters: ReportFilters;
}

export function ReportContent({ reportData, isLoading, filters }: ReportContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SummaryCardsSkeleton />
        <PhotographerTableSkeleton />
        {(filters.reportScope === 'cameras' || filters.reportScope === 'both') && (
          <>
            <CameraStatsGridSkeleton />
            <EquipmentTableSkeleton />
          </>
        )}
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-16">
        <FileX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load report data. Please try refreshing the page.
        </p>
      </div>
    );
  }

  // Check if we have empty results
  const hasData = reportData.photographers.length > 0 || 
                  reportData.cameraSets.length > 0 || 
                  (reportData.assignments && reportData.assignments.length > 0);

  if (!hasData) {
    return (
      <div className="text-center py-16">
        <FileX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SummaryCards summary={reportData.summary} />
      <PhotographerSummaryTable photographers={reportData.photographers} />
      
      {/* Only show camera sections if scope includes cameras */}
      {(filters.reportScope === 'cameras' || filters.reportScope === 'both') && (
        <>
          <CameraModelStats cameraSets={reportData.cameraSets} />
          <CameraEquipmentTable cameraSets={reportData.cameraSets} />
        </>
      )}
      
      {/* Only show assignment details if scope includes assignments and details are enabled */}
      {filters.includeAssignmentDetails && (filters.reportScope === 'assignments' || filters.reportScope === 'both') && reportData.assignments && reportData.assignments.length > 0 && (
        <AssignmentDetailsTable assignments={reportData.assignments} />
      )}
    </div>
  );
}
