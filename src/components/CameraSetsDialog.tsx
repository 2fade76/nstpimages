
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

interface CameraSet {
  id: string;
  photographer_id: string;
  camera_body_model: string | null;
  camera_body_serial: string | null;
  lens_16_35_serial: string | null;
  lens_24_105_serial: string | null;
  lens_70_200_serial: string | null;
  battery_grip_serial: string | null;
  flash_serial: string | null;
  adapter_serial: string | null;
  camera_year_make: string | null;
  lens_16_35_year_make: string | null;
  lens_24_105_year_make: string | null;
  lens_70_200_year_make: string | null;
  battery_grip_year_make: string | null;
  flash_year_make: string | null;
  adapter_year_make: string | null;
  date_received: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

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
