import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Camera, Layers, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface CameraSet {
  id: string;
  camera_body_model: string;
  camera_body_serial: string;
  camera_year_make: string;
  lens_16_35_serial: string;
  lens_24_105_serial: string;
  lens_70_200_serial: string;
  battery_grip_serial: string;
  flash_serial: string;
  adapter_serial: string;
  photographer_name: string;
  status: string;
  date_received: string;
  notes: string;
}

interface PhotoAssetSummaryReportProps {
  cameraSets: CameraSet[];
}

export function PhotoAssetSummaryReport({ cameraSets }: PhotoAssetSummaryReportProps) {
  // Calculate summary stats
  const totalCameraSets = cameraSets.length;
  const uniqueModels = [...new Set(cameraSets.map(c => c.camera_body_model).filter(Boolean))].length;
  const activeSets = cameraSets.filter(c => c.status === 'active').length;
  const inactiveSets = cameraSets.filter(c => c.status !== 'active').length;

  // Calculate camera model statistics
  const modelStats = cameraSets.reduce((acc, set) => {
    const model = set.camera_body_model || 'Unknown';
    if (!acc[model]) {
      acc[model] = { total: 0, active: 0, inactive: 0 };
    }
    acc[model].total++;
    if (set.status === 'active') {
      acc[model].active++;
    } else {
      acc[model].inactive++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number; inactive: number }>);

  const sortedModels = Object.entries(modelStats).sort((a, b) => b[1].total - a[1].total);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'retired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatValue = (value: string | null | undefined) => {
    if (!value || value === 'N/A' || value === '-') return 'N/A';
    return value;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr === 'N/A' || dateStr === '-') return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Photo Asset Summary Report</h2>
        <p className="text-muted-foreground">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCameraSets}</p>
              <p className="text-xs text-muted-foreground">Total Camera Sets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueModels}</p>
              <p className="text-xs text-muted-foreground">Unique Models</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSets}</p>
              <p className="text-xs text-muted-foreground">Active Sets</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inactiveSets}</p>
              <p className="text-xs text-muted-foreground">Inactive Sets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Model Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Camera Model Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Camera Model</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center">Inactive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedModels.map(([model, stats]) => (
                <TableRow key={model}>
                  <TableCell className="font-medium">{model}</TableCell>
                  <TableCell className="text-center">{stats.total}</TableCell>
                  <TableCell className="text-center text-green-600 dark:text-green-400">{stats.active}</TableCell>
                  <TableCell className="text-center text-red-600 dark:text-red-400">{stats.inactive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Camera Equipment Details */}
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
                  <TableHead>Camera</TableHead>
                  <TableHead>Body S/N</TableHead>
                  <TableHead>Body Year</TableHead>
                  <TableHead>16-35mm S/N</TableHead>
                  <TableHead>24-105mm S/N</TableHead>
                  <TableHead>70-200mm S/N</TableHead>
                  <TableHead>Battery Grip S/N</TableHead>
                  <TableHead>Flash S/N</TableHead>
                  <TableHead>Adapter S/N</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cameraSets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell className="font-medium whitespace-nowrap">{set.photographer_name}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatValue(set.camera_body_model)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatValue(set.camera_body_serial)}</TableCell>
                    <TableCell>{formatValue(set.camera_year_make)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatValue(set.lens_16_35_serial)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatValue(set.lens_24_105_serial)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatValue(set.lens_70_200_serial)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatValue(set.battery_grip_serial)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatValue(set.flash_serial)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatValue(set.adapter_serial)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(set.date_received)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(set.status)}>
                        {set.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={set.notes || ''}>
                      {formatValue(set.notes)}
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
