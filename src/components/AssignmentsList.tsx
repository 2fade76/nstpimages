
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { AssignmentFilters } from "./AssignmentFilters";
import { AssignmentListContent } from "./AssignmentListContent";
import { AssignmentDialogs } from "./AssignmentDialogs";
import { useAssignmentMutations } from "./hooks/useAssignmentMutations";
import { useAssignmentFilters } from "./hooks/useAssignmentFilters";
import { useAssignmentsData } from "./hooks/useAssignmentsData";
import { useAssignmentsRealtime } from "./hooks/useAssignmentsRealtime";

interface AssignmentsListProps {
  onStatusUpdate?: () => void;
  searchQuery?: string;
  isSearchActive?: boolean;
  onSearchComplete?: () => void;
  statusFilter?: 'all' | 'open' | 'complete' | 'today-complete';
}

export const AssignmentsList = ({ 
  onStatusUpdate, 
  searchQuery = "", 
  isSearchActive = false,
  onSearchComplete,
  statusFilter = 'all'
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    sortField,
    sortDirection,
    currentPage,
    selectedPhotographerFilter,
    handleSort,
    handlePageChange,
    handlePhotographerFilterChange,
    setCurrentPage
  } = useAssignmentFilters();

  const shouldSearch = Boolean(searchQuery?.trim());

  const {
    assignments,
    totalCount,
    totalPages,
    isLoading,
    refetch
  } = useAssignmentsData({
    searchQuery,
    currentPage,
    sortField,
    sortDirection,
    selectedPhotographerFilter,
    statusFilter,
    isSearchActive,
    onSearchComplete
  });

  // Setup real-time subscriptions
  useAssignmentsRealtime();

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

  const {
    updateAssignmentMutation,
    deleteAssignmentMutation
  } = useAssignmentMutations({
    onStatusUpdate,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    toast,
    queryClient
  });

  // Force refetch when page changes
  useEffect(() => {
    console.log("Page changed to:", currentPage, "- forcing refetch");
    refetch();
  }, [currentPage, refetch]);

  // Reset page and refetch when search query changes
  useEffect(() => {
    if (searchQuery?.trim()) {
      setCurrentPage(1);
      refetch();
    }
  }, [searchQuery, refetch, setCurrentPage]);

  // Only reset photographer filter when there's an actual search query
  useEffect(() => {
    if (searchQuery?.trim()) {
      console.log("Search query detected, resetting photographer filter");
      handlePhotographerFilterChange(null);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Reset page when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, setCurrentPage]);

  const handleEditClick = (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => {
    setCurrentAssignment(assignment);
    
    let dateValue = assignment.date || '';
    let timeValue = assignment.time ? assignment.time.substring(0, 5) : '12:00';
    
    console.log("Edit assignment with date:", dateValue, "and time:", timeValue);
    
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

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", editForm);
    
    const updatedAssignment: Partial<Assignment> = {
      title: editForm.title,
      location: editForm.location,
      date: editForm.date,
      time: editForm.time + ':00',
      photographer_id: editForm.photographer_id,
      status: editForm.status as Assignment['status']
    };
    
    console.log("Sending updated assignment to mutation:", updatedAssignment);
    updateAssignmentMutation.mutate({ assignment: updatedAssignment, currentAssignment });
  };

  const handleDeleteAssignment = () => {
    if (currentAssignment) {
      console.log("Confirming delete for assignment ID:", currentAssignment.id);
      deleteAssignmentMutation.mutate(currentAssignment.id);
    } else {
      console.error("No assignment selected for deletion");
      toast({
        title: "Error",
        description: "No assignment selected for deletion.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-end mb-4">
          <AssignmentFilters
            photographers={photographers}
            selectedPhotographerFilter={selectedPhotographerFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            onPhotographerFilterChange={handlePhotographerFilterChange}
            onSort={handleSort}
          />
        </div>

        <AssignmentListContent
          assignments={assignments}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          shouldSearch={shouldSearch}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onPhotographerClick={setSelectedPhotographerId}
          onPageChange={handlePageChange}
        />
      </div>

      <AssignmentDialogs
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        selectedPhotographerId={selectedPhotographerId}
        currentAssignment={currentAssignment}
        photographers={photographers}
        editForm={editForm}
        assignments={assignments}
        isSubmitting={updateAssignmentMutation.isPending}
        isDeleting={deleteAssignmentMutation.isPending}
        onEditDialogClose={() => setIsEditDialogOpen(false)}
        onDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
        onPhotographerDialogClose={() => setSelectedPhotographerId(null)}
        onFormChange={handleFormChange}
        onSubmit={handleUpdateAssignment}
        onDeleteConfirm={handleDeleteAssignment}
      />
    </>
  );
};
