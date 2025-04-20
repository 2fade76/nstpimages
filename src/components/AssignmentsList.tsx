
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AssignmentWithPhotographer, AssignmentEditForm, SortDirection, SortField } from "@/types/assignments";
import { useAssignments } from "@/hooks/useAssignments";
import { AssignmentCard } from "./assignments/AssignmentCard";
import { AssignmentFilters } from "./assignments/AssignmentFilters";
import { EditAssignmentDialog } from "./assignments/EditAssignmentDialog";
import { DeleteAssignmentDialog } from "./assignments/DeleteAssignmentDialog";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";

interface AssignmentsListProps {
  onStatusUpdate?: () => void;
  searchQuery?: string;
  isSearchActive?: boolean;
  onSearchComplete?: () => void;
}

export function AssignmentsList({ 
  onStatusUpdate, 
  searchQuery = "", 
  isSearchActive = false,
  onSearchComplete
}: AssignmentsListProps) {
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentWithPhotographer | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [editForm, setEditForm] = useState<AssignmentEditForm>({
    title: "",
    location: "",
    date: "",
    time: "",
    photographer_id: "",
    status: "open",
  });

  const {
    assignments,
    isLoading,
    updateAssignment,
    deleteAssignment,
    isUpdating,
    isDeleting
  } = useAssignments(searchQuery);

  const { data: photographers } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const sortedAndFilteredAssignments = useMemo(() => {
    if (!assignments) return [];
    
    let filtered = assignments;
    
    if (selectedPhotographerId) {
      filtered = assignments.filter(assignment => 
        assignment.photographer_id === selectedPhotographerId
      );
    }
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateA - dateB;
      } else if (sortField === 'status') {
        const statusOrder = { 'open': 0, 'progress': 1, 'complete': 2, 'cancel': 3 };
        comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                    (statusOrder[b.status as keyof typeof statusOrder] || 0);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [assignments, sortField, sortDirection, selectedPhotographerId]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditClick = (assignment: AssignmentWithPhotographer) => {
    setCurrentAssignment(assignment);
    let dateValue = assignment.date;
    let timeValue = "12:00";
    
    if (assignment.date.includes('T')) {
      const [datePart, timePart] = assignment.date.split('T');
      dateValue = datePart;
      if (timePart) {
        timeValue = timePart.substring(0, 5);
      }
    }
    
    setEditForm({
      title: assignment.title,
      location: assignment.location,
      date: dateValue,
      time: timeValue,
      photographer_id: assignment.photographer_id,
      status: assignment.status,
    });
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAssignment) return;

    const combinedDate = `${editForm.date}T${editForm.time}:00`;
    
    updateAssignment({
      id: currentAssignment.id,
      title: editForm.title,
      location: editForm.location,
      date: combinedDate,
      photographer_id: editForm.photographer_id,
      status: editForm.status
    });

    setIsEditDialogOpen(false);
    if (onStatusUpdate) {
      onStatusUpdate();
    }
  };

  const handleDeleteClick = (assignment: AssignmentWithPhotographer) => {
    setCurrentAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAssignment = () => {
    if (currentAssignment) {
      deleteAssignment(currentAssignment.id);
      setIsDeleteDialogOpen(false);
    }
  };

  // Reset photographer filter when search is performed
  useEffect(() => {
    if (searchQuery?.trim()) {
      setSelectedPhotographerId(null);
    }
  }, [searchQuery]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {sortedAndFilteredAssignments.length} {searchQuery ? "matching" : "total"} assignments
            {searchQuery && <span className="ml-2 font-medium">Search: "{searchQuery}"</span>}
          </div>
          
          <AssignmentFilters
            selectedPhotographerId={selectedPhotographerId}
            photographers={photographers}
            sortField={sortField}
            sortDirection={sortDirection}
            onPhotographerChange={setSelectedPhotographerId}
            onSortChange={handleSort}
          />
        </div>

        {sortedAndFilteredAssignments.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            {searchQuery 
              ? `No assignments found matching "${searchQuery}". Try a different search term.` 
              : "No assignments found. Create a new assignment to get started."}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAndFilteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onPhotographerClick={setSelectedPhotographerId}
              />
            ))}
          </div>
        )}
      </div>

      <EditAssignmentDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onSubmit={handleUpdateAssignment}
        photographers={photographers}
        isPending={isUpdating}
      />

      <DeleteAssignmentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        assignment={currentAssignment}
        onConfirm={handleDeleteAssignment}
        isPending={isDeleting}
      />

      {selectedPhotographerId && (
        <PhotographerInfoDialog
          isOpen={true}
          onClose={() => setSelectedPhotographerId(null)}
          photographerId={selectedPhotographerId}
          assignments={sortedAndFilteredAssignments?.filter(a => 
            a.photographers.id === selectedPhotographerId
          ).length || 0}
        />
      )}
    </>
  );
}

