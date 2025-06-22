
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Photographer } from "@/types/database";
import { Mail, Phone, Camera, Hash } from "lucide-react";

interface PhotographerInfoDialogProps {
  photographer: Photographer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotographerInfoDialog = ({ photographer, isOpen, onClose }: PhotographerInfoDialogProps) => {
  if (!photographer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {photographer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {photographer.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge 
              variant={photographer.status === 'staff' ? 'default' : 'secondary'}
              className={
                photographer.status === 'staff' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }
            >
              {photographer.status === 'staff' ? 'Staff' : 'Stringers'}
            </Badge>
          </div>

          {/* Contact Information */}
          {photographer.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{photographer.email}</p>
              </div>
            </div>
          )}

          {photographer.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{photographer.phone}</p>
              </div>
            </div>
          )}

          {/* Equipment Information */}
          {photographer.camera_body && (
            <div className="flex items-center gap-3">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Camera Body</p>
                <p className="text-sm text-muted-foreground">{photographer.camera_body}</p>
              </div>
            </div>
          )}

          {photographer.serial_number && (
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Serial Number</p>
                <p className="text-sm text-muted-foreground">{photographer.serial_number}</p>
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Added on {new Date(photographer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
