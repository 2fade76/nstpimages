
import React from "react";
import { Assignment, Photographer } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface DeleteAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentAssignment: (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) | null;
  onDelete: () => void;
  isPending: boolean;
}

export const DeleteAssignmentDialog = ({
  isOpen,
  onOpenChange,
  currentAssignment,
  onDelete,
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
          <p className="font-medium mt-2">{currentAssignment?.title}</p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
