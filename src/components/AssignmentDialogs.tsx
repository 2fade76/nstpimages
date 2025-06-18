
import { Assignment, Photographer } from "@/types/database";
import { EditAssignmentDialog } from "./EditAssignmentDialog";
import { DeleteAssignmentDialog } from "./DeleteAssignmentDialog";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";

interface AssignmentDialogsProps {
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedPhotographerId: string | null;
  currentAssignment: (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) | null;
  photographers?: Photographer[];
  editForm: {
    title: string;
    location: string;
    date: string;
    time: string;
    photographer_id: string;
    status: Assignment['status'];
  };
  assignments: (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> })[];
  isSubmitting: boolean;
  isDeleting: boolean;
  onEditDialogClose: () => void;
  onDeleteDialogClose: () => void;
  onPhotographerDialogClose: () => void;
  onFormChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDeleteConfirm: () => void;
}

export const AssignmentDialogs = ({
  isEditDialogOpen,
  isDeleteDialogOpen,
  selectedPhotographerId,
  currentAssignment,
  photographers,
  editForm,
  assignments,
  isSubmitting,
  isDeleting,
  onEditDialogClose,
  onDeleteDialogClose,
  onPhotographerDialogClose,
  onFormChange,
  onSubmit,
  onDeleteConfirm
}: AssignmentDialogsProps) => {
  return (
    <>
      <EditAssignmentDialog
        isOpen={isEditDialogOpen}
        onClose={onEditDialogClose}
        assignment={currentAssignment}
        photographers={photographers}
        editForm={editForm}
        onFormChange={onFormChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteAssignmentDialog
        isOpen={isDeleteDialogOpen}
        onClose={onDeleteDialogClose}
        assignment={currentAssignment}
        onConfirm={onDeleteConfirm}
        isDeleting={isDeleting}
      />

      {selectedPhotographerId && (
        <PhotographerInfoDialog
          isOpen={true}
          onClose={onPhotographerDialogClose}
          photographerId={selectedPhotographerId}
          assignments={assignments?.filter(a => a.photographers.id === selectedPhotographerId).length || 0}
        />
      )}
    </>
  );
};
