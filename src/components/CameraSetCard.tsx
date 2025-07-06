import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { CameraSet } from "@/types/database";
interface CameraSetCardProps {
  cameraSet: CameraSet;
  onEdit: (cameraSet: CameraSet) => void;
  onDelete: (id: string) => void;
}
export function CameraSetCard({
  cameraSet,
  onEdit,
  onDelete
}: CameraSetCardProps) {
  return <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">
              {cameraSet.camera_body_model || 'Camera Set'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={cameraSet.status === 'active' ? 'default' : 'secondary'} className="bg-lime-500">
                {cameraSet.status}
              </Badge>
              {cameraSet.date_received && <span className="text-sm text-muted-foreground">
                  Received: {new Date(cameraSet.date_received).toLocaleDateString()}
                </span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(cameraSet)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(cameraSet.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {cameraSet.camera_body_serial && <div>
              <span className="font-medium">Body Serial:</span> {cameraSet.camera_body_serial}
            </div>}
          {cameraSet.lens_16_35_serial && <div>
              <span className="font-medium">16-35mm Lens:</span> {cameraSet.lens_16_35_serial}
            </div>}
          {cameraSet.lens_24_105_serial && <div>
              <span className="font-medium">24-105mm Lens:</span> {cameraSet.lens_24_105_serial}
            </div>}
          {cameraSet.lens_70_200_serial && <div>
              <span className="font-medium">70-200mm Lens:</span> {cameraSet.lens_70_200_serial}
            </div>}
          {cameraSet.battery_grip_serial && <div>
              <span className="font-medium">Battery Grip:</span> {cameraSet.battery_grip_serial}
            </div>}
          {cameraSet.flash_serial && <div>
              <span className="font-medium">Flash:</span> {cameraSet.flash_serial}
            </div>}
        </div>
        {cameraSet.notes && <div className="mt-3 pt-3 border-t">
            <span className="font-medium text-sm">Notes:</span>
            <p className="text-sm text-muted-foreground mt-1">{cameraSet.notes}</p>
          </div>}
      </CardContent>
    </Card>;
}