
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignmentWithPhotographer } from "@/types/assignments";

interface DeleteAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: AssignmentWithPhotographer | null;
  onConfirm: () => void;
  isPending: boolean;
}

export const DeleteAssignmentDialog = ({
  isOpen,
  onOpenChange,
  assignment,
  onConfirm,
  isPending,
}: DeleteAssignmentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this assignment?</p>
          <p className="font-medium mt-2">{assignment?.title}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

