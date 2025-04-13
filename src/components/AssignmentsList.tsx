
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";
import { AssignmentCard } from "./assignment/AssignmentCard";
import { EditAssignmentDialog } from "./assignment/EditAssignmentDialog";
import { DeleteAssignmentDialog } from "./assignment/DeleteAssignmentDialog";
import { AssignmentSortControls } from "./assignment/AssignmentSortControls";
import { useAssignments } from "@/hooks/use-assignments";

interface AssignmentsListProps {
  onStatusUpdate?: () => void;
  searchQuery?: string;
  isSearchActive?: boolean;
  onSearchComplete?: () => void;
}

export const AssignmentsList = ({ 
  onStatusUpdate, 
  searchQuery = "", 
  isSearchActive = false,
  onSearchComplete
}: AssignmentsListProps) => {
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<(Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    photographer_id: "",
    status: "" as Assignment['status'],
  });

  const {
    assignments: sortedAssignments,
    isLoading,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    updateAssignmentMutation,
    deleteAssignmentMutation
  } = useAssignments(searchQuery, isSearchActive, onStatusUpdate, onSearchComplete);

  const { data: photographers } = useQuery({
    queryKey: ['photographers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photographers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Photographer[];
    },
  });

  useEffect(() => {
    if (searchQuery?.trim()) {
      refetch();
    }
  }, [searchQuery, refetch]);

  useEffect(() => {
    console.log("Setting up real-time subscription in AssignmentsList");
    const channel = supabase
      .channel('assignments-list-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Received real-time update in AssignmentsList:", payload);
          console.log("Invalidating and refetching assignments query");
          refetch();
        }
      )
      .subscribe();

    console.log("Subscribed to real-time updates for assignments");

    return () => {
      console.log("Unsubscribing from assignments-list-changes channel");
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleEditClick = (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => {
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

  const handleDeleteClick = (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => {
    console.log("Opening delete dialog for assignment:", assignment.id);
    setCurrentAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", editForm);
    
    if (!currentAssignment) return;
    
    const combinedDate = `${editForm.date}T${editForm.time}:00`;
    console.log("Combined date and time:", combinedDate);
    
    const updatedAssignment = {
      id: currentAssignment.id,
      title: editForm.title,
      location: editForm.location,
      date: combinedDate,
      photographer_id: editForm.photographer_id,
      status: editForm.status
    };
    
    console.log("Sending updated assignment to mutation:", updatedAssignment);
    updateAssignmentMutation.mutate(updatedAssignment);
    setIsEditDialogOpen(false);
  };

  const handleDeleteAssignment = () => {
    if (currentAssignment) {
      console.log("Confirming delete for assignment ID:", currentAssignment.id);
      deleteAssignmentMutation.mutate(currentAssignment.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const shouldSearch = Boolean(searchQuery?.trim());

  if (isLoading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            {sortedAssignments.length} {shouldSearch ? "matching" : "total"} assignments
            {shouldSearch && <span className="ml-2 font-medium">Search: "{searchQuery}"</span>}
          </div>
          <AssignmentSortControls 
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>

        {sortedAssignments?.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            {shouldSearch 
              ? `No assignments found matching "${searchQuery}". Try a different search term.` 
              : "No assignments found. Create a new assignment to get started."}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAssignments?.map((assignment) => (
              <AssignmentCard 
                key={assignment.id}
                assignment={assignment}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onPhotographerClick={setSelectedPhotographerId}
              />
            ))}
          </div>
        )}
      </div>

      <EditAssignmentDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        currentAssignment={currentAssignment}
        editForm={editForm}
        setEditForm={setEditForm}
        photographers={photographers}
        onSubmit={handleUpdateAssignment}
        isPending={updateAssignmentMutation.isPending}
      />

      <DeleteAssignmentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentAssignment={currentAssignment}
        onDelete={handleDeleteAssignment}
        isPending={deleteAssignmentMutation.isPending}
      />

      {selectedPhotographerId && (
        <PhotographerInfoDialog
          isOpen={true}
          onClose={() => setSelectedPhotographerId(null)}
          photographerId={selectedPhotographerId}
          assignments={sortedAssignments?.filter(a => a.photographers.id === selectedPhotographerId).length || 0}
        />
      )}
    </>
  );
};
