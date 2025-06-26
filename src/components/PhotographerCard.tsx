
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, Camera, Hash, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Photographer } from "@/types/database";

interface PhotographerCardProps {
  photographer: Photographer;
  onEdit: (photographer: Photographer) => void;
  onDelete: (id: string) => void;
}

const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'staff':
      return 'Staff Photographer';
    case 'stringers':
      return 'Stringer Photographer';
    case 'staff_oc':
      return 'Staff OC';
    default:
      return status;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'staff':
    case 'staff_oc':
      return 'default' as const;
    case 'stringers':
      return 'secondary' as const;
    default:
      return 'secondary' as const;
  }
};

export function PhotographerCard({ photographer, onEdit, onDelete }: PhotographerCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <h3 className="font-semibold">{photographer.name}</h3>
          </div>
          <Badge variant={getStatusVariant(photographer.status)}>
            {getStatusDisplay(photographer.status)}
          </Badge>
        </div>
        
        {photographer.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Mail className="h-4 w-4" />
            <span>{photographer.email}</span>
          </div>
        )}
        
        {photographer.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Phone className="h-4 w-4" />
            <span>{photographer.phone}</span>
          </div>
        )}

        {photographer.Location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            <span>{photographer.Location}</span>
          </div>
        )}

        {photographer.camera_body && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Camera className="h-4 w-4" />
            <span>{photographer.camera_body}</span>
          </div>
        )}

        {photographer.serial_number && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Hash className="h-4 w-4" />
            <span>{photographer.serial_number}</span>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(photographer)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(photographer.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
