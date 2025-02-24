
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface PhotographerInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  photographer: string;
  assignments: number;
}

export const PhotographerInfoDialog = ({
  isOpen,
  onClose,
  photographer,
  assignments,
}: PhotographerInfoDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{photographer}</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">{assignments}</p>
              <p className="text-sm text-muted-foreground">Total Assignments</p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
