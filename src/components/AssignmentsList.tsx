import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { AssignmentCard } from "./AssignmentCard";
import { AssignmentFilters } from "./AssignmentFilters";
import { AssignmentPagination } from "./AssignmentPagination";
import { EditAssignmentDialog } from "./EditAssignmentDialog";
import { DeleteAssignmentDialog } from "./DeleteAssignmentDialog";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";
import { useAssignmentMutations } from "./hooks/useAssignmentMutations";
import { useAssignmentFilters } from "./hooks/useAssignmentFilters";
import { format, startOfDay, endOfDay } from "date-fns";

interface AssignmentsListProps {
  onStatusUpdate?: () => void;
  searchQuery?: string;
  isSearchActive?: boolean;
  onSearchComplete?: () => void;
  statusFilter?: 'all' | 'open' | 'complete' | 'today-complete';
}

const ITEMS_PER_PAGE = 10;

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

  const { data: assignmentsData, isLoading, refetch } = useQuery({
    queryKey: ['assignments', searchQuery, currentPage, sortField, sortDirection, selectedPhotographerFilter, statusFilter],
    queryFn: async () => {
      console.log("Fetching assignments data", shouldSearch ? `with search: ${searchQuery}` : "without search", `with status filter: ${statusFilter}`);
      
      let query = supabase
        .from('assignments')
        .select(`
          *,
          photographers (
            id,
            name
          )
        `, { count: 'exact' });
        
      if (shouldSearch) {
        const searchTerm = `%${searchQuery.trim().toLowerCase()}%`;
        query = query.or(`title.ilike.${searchTerm},location.ilike.${searchTerm}`);
      }

      if (selectedPhotographerFilter) {
        query = query.eq('photographer_id', selectedPhotographerFilter);
      }

      // Apply status filter
      if (statusFilter === 'open') {
        query = query.eq('status', 'open');
      } else if (statusFilter === 'complete') {
        query = query.eq('status', 'complete');
      } else if (statusFilter === 'today-complete') {
        const today = new Date();
        const startOfToday = startOfDay(today).toISOString();
        const endOfToday = endOfDay(today).toISOString();
        query = query
          .eq('status', 'complete')
          .gte('date', startOfToday)
          .lte('date', endOfToday);
      }
      
      // Fix the sorting logic - when sortDirection is 'desc', we want descending order (false for ascending)
      if (sortField === 'date') {
        query = query.order('date', { ascending: sortDirection === 'asc' });
      } else if (sortField === 'status') {
        query = query.order('status', { ascending: sortDirection === 'asc' });
      } else if (sortField === 'photographer') {
        query = query.order('photographers(name)', { ascending: sortDirection === 'asc' });
      }
      
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
      
      console.log("Assignments data fetched:", data?.length || 0, "records", "Total count:", count);
      
      if (onSearchComplete) {
        onSearchComplete();
      }
      
      return {
        assignments: data as (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> })[],
        totalCount: count || 0
      };
    },
    enabled: !isSearchActive || shouldSearch,
  });

  const assignments = assignmentsData?.assignments || [];
  const totalCount = assignmentsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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

  useEffect(() => {
    if (searchQuery?.trim()) {
      setCurrentPage(1);
      refetch();
    }
  }, [searchQuery, refetch, setCurrentPage]);

  useEffect(() => {
    handlePhotographerFilterChange(null);
    setCurrentPage(1);
  }, [searchQuery, handlePhotographerFilterChange, setCurrentPage]);

  // Reset page when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, setCurrentPage]);

  useEffect(() => {
    console.log("Setting up real-time subscription in AssignmentsList");
    const channel = supabase
      .channel('assignments-list-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Received real-time update in AssignmentsList:", payload);
          console.log("Invalidating and refetching assignments query");
          
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          queryClient.refetchQueries({ queryKey: ['assignments'] });
          
          refetch();
        }
      )
      .subscribe();

    console.log("Subscribed to real-time updates for assignments");

    return () => {
      console.log("Unsubscribing from assignments-list-changes channel");
      supabase.removeChannel(channel);
    };
  }, [queryClient, refetch]);

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

  const getFilterDescription = () => {
    switch (statusFilter) {
      case 'open':
        return 'Open assignments';
      case 'complete':
        return 'Completed assignments';
      case 'today-complete':
        return "Today's completed assignments";
      default:
        return 'All assignments';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading assignments...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Showing {assignments.length} of {totalCount} {getFilterDescription().toLowerCase()} {shouldSearch && <span className="ml-2 font-medium">Search: "{searchQuery}"</span>}
            {totalPages > 1 && (
              <span className="ml-2">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
          <AssignmentFilters
            photographers={photographers}
            selectedPhotographerFilter={selectedPhotographerFilter}
            sortField={sortField}
            sortDirection={sortDirection}
            onPhotographerFilterChange={handlePhotographerFilterChange}
            onSort={handleSort}
          />
        </div>

        {assignments?.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            {shouldSearch 
              ? `No assignments found matching "${searchQuery}". Try a different search term.` 
              : `No ${getFilterDescription().toLowerCase()} found.`}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {assignments?.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onPhotographerClick={setSelectedPhotographerId}
                />
              ))}
            </div>

            <AssignmentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <EditAssignmentDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        assignment={currentAssignment}
        photographers={photographers}
        editForm={editForm}
        onFormChange={handleFormChange}
        onSubmit={handleUpdateAssignment}
        isSubmitting={updateAssignmentMutation.isPending}
      />

      <DeleteAssignmentDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        assignment={currentAssignment}
        onConfirm={handleDeleteAssignment}
        isDeleting={deleteAssignmentMutation.isPending}
      />

      {selectedPhotographerId && (
        <PhotographerInfoDialog
          isOpen={true}
          onClose={() => setSelectedPhotographerId(null)}
          photographerId={selectedPhotographerId}
          assignments={assignments?.filter(a => a.photographers.id === selectedPhotographerId).length || 0}
        />
      )}
    </>
  );
};
