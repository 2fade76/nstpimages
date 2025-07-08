
import { Skeleton } from "@/components/ui/skeleton";
import { ReportFilters } from "@/pages/Reports";
import { SummaryCards } from "./SummaryCards";
import { PhotographerSummaryTable } from "./PhotographerSummaryTable";
import { CameraEquipmentTable } from "./CameraEquipmentTable";

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
    date_received: string;
    notes: string;
  }>;
  summary: {
    totalPhotographers: number;
    totalAssignments: number;
    totalCameraSets: number;
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!reportData) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <SummaryCards summary={reportData.summary} />
      <PhotographerSummaryTable photographers={reportData.photographers} />
      <CameraEquipmentTable cameraSets={reportData.cameraSets} />
    </div>
  );
}
