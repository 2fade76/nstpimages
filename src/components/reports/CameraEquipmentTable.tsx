
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface CameraEquipmentTableProps {
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
}

export function CameraEquipmentTable({ cameraSets }: CameraEquipmentTableProps) {
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
              {cameraSets.map((cameraSet) => (
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
  );
}
