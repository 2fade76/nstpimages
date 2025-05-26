
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Assignment, Photographer } from "@/types/database";

interface DeleteAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> } | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteAssignmentDialog = ({
  isOpen,
  onClose,
  assignment,
  onConfirm,
  isDeleting
}: DeleteAssignmentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this assignment?</p>
          <p className="font-medium mt-2">{assignment?.title}</p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
