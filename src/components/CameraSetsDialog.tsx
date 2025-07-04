
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCameraSets } from "@/hooks/useCameraSets";
import { CameraSetsList } from "./CameraSetsList";
import { CameraSetForm } from "./CameraSetForm";
import { CameraSet } from "@/types/database";

interface CameraSetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  photographerId: string;
  photographerName: string;
}

export function CameraSetsDialog({
  isOpen,
  onClose,
  photographerId,
  photographerName,
}: CameraSetsDialogProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<CameraSet | null>(null);

  const {
    cameraSets,
    isLoading,
    isSubmitting,
    handleSubmit,
    handleDelete,
  } = useCameraSets(photographerId, isOpen);

  const handleAddNew = () => {
    setEditingSet(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cameraSet: CameraSet) => {
    setEditingSet(cameraSet);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: any, editingSet: CameraSet | null) => {
    await handleSubmit(formData, editingSet);
    setIsFormOpen(false);
    setEditingSet(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSet(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Camera Sets - {photographerName}</DialogTitle>
          </DialogHeader>

          <CameraSetsList
            cameraSets={cameraSets}
            isLoading={isLoading}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </DialogContent>
      </Dialog>

      <CameraSetForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editingSet={editingSet}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
