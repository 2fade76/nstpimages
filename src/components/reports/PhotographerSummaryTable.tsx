
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Aperture, Zap, Battery, Box } from "lucide-react";

interface CameraSet {
  id: string;
  camera_body_model: string | null;
  camera_body_serial: string | null;
  lens_16_35_serial: string | null;
  lens_24_105_serial: string | null;
  lens_70_200_serial: string | null;
  battery_grip_serial: string | null;
  flash_serial: string | null;
  adapter_serial: string | null;
  status: string;
}

interface PhotographerSummaryTableProps {
  photographers: Array<{
    id: string;
    name: string;
    awards: string | null;
    assignmentCount: number;
    completedAssignments: number;
    openAssignments: number;
    cancelledAssignments: number;
    cameraSets: CameraSet[];
  }>;
}

function AssetsList({ cameraSets }: { cameraSets: CameraSet[] }) {
  if (cameraSets.length === 0) {
    return <span className="text-muted-foreground text-sm">No assets assigned</span>;
  }

  // Collect all assets from all camera sets
  const assets: { type: string; serial: string; model?: string; icon: React.ReactNode }[] = [];

  cameraSets.forEach((set, index) => {
    const setLabel = cameraSets.length > 1 ? ` (Set ${index + 1})` : '';
    
    if (set.camera_body_serial && set.camera_body_serial !== 'N/A') {
      assets.push({
        type: 'Camera Body',
        serial: set.camera_body_serial,
        model: set.camera_body_model || undefined,
        icon: <Camera className="h-3.5 w-3.5" />
      });
    }
    if (set.lens_16_35_serial && set.lens_16_35_serial !== 'N/A') {
      assets.push({
        type: 'Lens 16-35mm',
        serial: set.lens_16_35_serial,
        icon: <Aperture className="h-3.5 w-3.5" />
      });
    }
    if (set.lens_24_105_serial && set.lens_24_105_serial !== 'N/A') {
      assets.push({
        type: 'Lens 24-105mm',
        serial: set.lens_24_105_serial,
        icon: <Aperture className="h-3.5 w-3.5" />
      });
    }
    if (set.lens_70_200_serial && set.lens_70_200_serial !== 'N/A') {
      assets.push({
        type: 'Lens 70-200mm',
        serial: set.lens_70_200_serial,
        icon: <Aperture className="h-3.5 w-3.5" />
      });
    }
    if (set.adapter_serial && set.adapter_serial !== 'N/A') {
      assets.push({
        type: 'Adapter',
        serial: set.adapter_serial,
        icon: <Box className="h-3.5 w-3.5" />
      });
    }
    if (set.battery_grip_serial && set.battery_grip_serial !== 'N/A') {
      assets.push({
        type: 'Battery Grip',
        serial: set.battery_grip_serial,
        icon: <Battery className="h-3.5 w-3.5" />
      });
    }
    if (set.flash_serial && set.flash_serial !== 'N/A') {
      assets.push({
        type: 'Flash',
        serial: set.flash_serial,
        icon: <Zap className="h-3.5 w-3.5" />
      });
    }
  });

  if (assets.length === 0) {
    return <span className="text-muted-foreground text-sm">No assets with serial numbers</span>;
  }

  return (
    <div className="space-y-1.5">
      {assets.map((asset, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{asset.icon}</span>
          <span className="font-medium">{asset.type}:</span>
          <span className="text-muted-foreground">
            {asset.model && <span className="mr-1">({asset.model})</span>}
            {asset.serial}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PhotographerSummaryTable({ photographers }: PhotographerSummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photographer Yearly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Awards & Recognition</TableHead>
              <TableHead>Total Assignments</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Open</TableHead>
              <TableHead>Cancelled</TableHead>
              <TableHead>Total Assets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {photographers.map((photographer, index) => (
              <TableRow 
                key={photographer.id}
                className={`hover:bg-muted/50 transition-colors ${
                  index % 2 === 0 ? 'bg-muted/20' : ''
                }`}
              >
                <TableCell className="font-medium">{photographer.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {photographer.awards || 'N/A'}
                </TableCell>
                <TableCell>{photographer.assignmentCount}</TableCell>
                <TableCell>
                  <Badge className="bg-[hsl(var(--stat-complete))] text-white">
                    {photographer.completedAssignments}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-[hsl(var(--stat-open))] text-white">
                    {photographer.openAssignments}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-destructive text-white">
                    {photographer.cancelledAssignments}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[250px]">
                  <AssetsList cameraSets={photographer.cameraSets} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
