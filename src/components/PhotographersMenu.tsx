
import { useState } from "react";
import { Photographer } from "@/types/database";
import { Loader2 } from "lucide-react";
import { PhotographerFormDialog } from "./PhotographerFormDialog";
import { PhotographerStatsCard } from "./PhotographerStatsCard";
import { CameraSetsDialog } from "./CameraSetsDialog";
import { PhotographersHeader } from "./PhotographersHeader";
import { PhotographersTable } from "./PhotographersTable";
import { usePhotographers } from "@/hooks/usePhotographers";

export function PhotographersMenu() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);
  const [cameraSetDialogOpen, setCameraSetDialogOpen] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<{ id: string; name: string } | null>(null);

  const {
    filteredPhotographers,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    refreshPhotographers,
  } = usePhotographers();

  const handleAddNew = () => {
    setEditingPhotographer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (photographer: Photographer) => {
    setEditingPhotographer(photographer);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    // Invalidate the query to refresh the photographers list after adding/editing
    refreshPhotographers();
  };

  const handleViewCameraSets = (photographer: Photographer) => {
    setSelectedPhotographer({ id: photographer.id, name: photographer.name });
    setCameraSetDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PhotographersHeader
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        onAddNew={handleAddNew}
        searchResultsCount={filteredPhotographers?.length}
      />
      
      <PhotographerStatsCard photographers={filteredPhotographers || []} />
      
      <PhotographersTable
        photographers={filteredPhotographers || []}
        searchQuery={searchQuery}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewCameraSets={handleViewCameraSets}
      />

      <PhotographerFormDialog 
        isOpen={isFormOpen} 
        onClose={handleCloseForm} 
        photographer={editingPhotographer} 
      />
      
      {selectedPhotographer && (
        <CameraSetsDialog
          isOpen={cameraSetDialogOpen}
          onClose={() => {
            setCameraSetDialogOpen(false);
            setSelectedPhotographer(null);
          }}
          photographerId={selectedPhotographer.id}
          photographerName={selectedPhotographer.name}
        />
      )}
    </div>
  );
}
