import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportFilters } from "@/pages/Reports";
import { format } from "date-fns";

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
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!reportData) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'open':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'active':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Photographers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalPhotographers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportData.summary.completedAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Camera Sets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalCameraSets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Photographer Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Photographer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total Assignments</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Cancelled</TableHead>
                <TableHead>Camera Sets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.photographers.map((photographer) => (
                <TableRow key={photographer.id}>
                  <TableCell className="font-medium">{photographer.name}</TableCell>
                  <TableCell>{photographer.assignmentCount}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500 text-white">
                      {photographer.completedAssignments}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-500 text-white">
                      {photographer.openAssignments}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-red-500 text-white">
                      {photographer.cancelledAssignments}
                    </Badge>
                  </TableCell>
                  <TableCell>{photographer.cameraSets.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Photographer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{assignment.location}</TableCell>
                  <TableCell>{format(new Date(assignment.date), 'PPP')}</TableCell>
                  <TableCell>{assignment.photographer_name}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Camera Sets Table - Enhanced with all details */}
      <Card>
        <CardHeader>
          <CardTitle>Camera Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photographer</TableHead>
                  <TableHead>Camera Body</TableHead>
                  <TableHead>Body Serial</TableHead>
                  <TableHead>Body Year/Make</TableHead>
                  <TableHead>16-35mm Lens</TableHead>
                  <TableHead>24-105mm Lens</TableHead>
                  <TableHead>70-200mm Lens</TableHead>
                  <TableHead>Battery Grip</TableHead>
                  <TableHead>Flash</TableHead>
                  <TableHead>Adapter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.cameraSets.map((cameraSet) => (
                  <TableRow key={cameraSet.id}>
                    <TableCell className="font-medium">{cameraSet.photographer_name}</TableCell>
                    <TableCell>{cameraSet.camera_body_model}</TableCell>
                    <TableCell className="font-mono text-sm">{cameraSet.camera_body_serial}</TableCell>
                    <TableCell>{cameraSet.camera_year_make}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{cameraSet.lens_16_35_serial}</div>
                        <div className="text-muted-foreground">{cameraSet.lens_16_35_year_make}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{cameraSet.lens_24_105_serial}</div>
                        <div className="text-muted-foreground">N/A</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{cameraSet.lens_70_200_serial}</div>
                        <div className="text-muted-foreground">{cameraSet.lens_70_200_year_make}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{cameraSet.battery_grip_serial}</div>
                        <div className="text-muted-foreground">{cameraSet.battery_grip_year_make}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{cameraSet.flash_serial}</div>
                        <div className="text-muted-foreground">{cameraSet.flash_year_make}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-mono">{cameraSet.adapter_serial}</div>
                        <div className="text-muted-foreground">{cameraSet.adapter_year_make}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(cameraSet.status)} text-white`}>
                        {cameraSet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cameraSet.date_received ? format(new Date(cameraSet.date_received), 'PPP') : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm truncate" title={cameraSet.notes}>
                        {cameraSet.notes || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
