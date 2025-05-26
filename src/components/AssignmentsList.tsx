import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, MapPin, User, Edit, Trash2, Search, Clock, ArrowUpDown, ArrowDown, ArrowUp, Filter } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import { AssignmentCard } from "./AssignmentCard";
import { AssignmentFilters } from "./AssignmentFilters";
import { AssignmentPagination } from "./AssignmentPagination";
import { EditAssignmentDialog } from "./EditAssignmentDialog";
import { DeleteAssignmentDialog } from "./DeleteAssignmentDialog";

interface AssignmentsListProps {
  onStatusUpdate?: () => void;
  searchQuery?: string;
  isSearchActive?: boolean;
  onSearchComplete?: () => void;
}

type SortField = 'date' | 'status' | 'photographer';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

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
  const [sortField, setSortField] = useState<'date' | 'status' | 'photographer'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    photographer_id: "",
    status: "" as Assignment['status'],
  });
  const [selectedPhotographerFilter, setSelectedPhotographerFilter] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const shouldSearch = Boolean(searchQuery?.trim());

  const { data: assignmentsData, isLoading, refetch } = useQuery({
    queryKey: ['assignments', searchQuery, currentPage, sortField, sortDirection, selectedPhotographerFilter],
    queryFn: async () => {
      console.log("Fetching assignments data", shouldSearch ? `with search: ${searchQuery}` : "without search");
      
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

  useEffect(() => {
    if (searchQuery?.trim()) {
      setCurrentPage(1);
      refetch();
    }
  }, [searchQuery, refetch]);

  useEffect(() => {
    setSelectedPhotographerFilter(null);
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSort = (field: 'date' | 'status' | 'photographer') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
    
    console.log(`Sorting changed to ${field} in ${sortDirection === 'asc' ? 'desc' : 'asc'} order`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePhotographerFilterChange = (photographerId: string | null) => {
    setSelectedPhotographerFilter(photographerId);
    setCurrentPage(1);
  };

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

  const updateAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: Partial<Assignment>) => {
      console.log("Updating assignment with data:", assignmentData);
      
      if (assignmentData.status && !['open', 'complete', 'cancelled'].includes(assignmentData.status)) {
        throw new Error(`Invalid status: ${assignmentData.status}`);
      }
      
      if (!currentAssignment?.id) {
        throw new Error("No valid assignment ID for update");
      }
      
      console.log(`Updating assignment ID: ${currentAssignment.id} with status: ${assignmentData.status}`);
      
      const { data, error } = await supabase
        .from('assignments')
        .update({
          title: assignmentData.title,
          location: assignmentData.location,
          date: assignmentData.date,
          time: assignmentData.time,
          photographer_id: assignmentData.photographer_id,
          status: assignmentData.status
        })
        .eq('id', currentAssignment.id)
        .select();
      
      if (error) {
        console.error("Update error from Supabase:", error);
        throw error;
      }
      
      console.log("Assignment updated successfully in database:", data);
      
      return data;
    },
    onSuccess: (data) => {
      console.log("Assignment updated successfully, invalidating queries");
      console.log("Updated data returned from server:", data);
      
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.refetchQueries({ 
        queryKey: ['assignments'],
        type: 'active',
        exact: false
      });
      
      queryClient.invalidateQueries({ queryKey: ['assignments-last-7-days'] });
      queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['photographer-completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['completed-assignments-by-date'] });
      
      if (onStatusUpdate) {
        console.log("Calling onStatusUpdate callback");
        onStatusUpdate();
      }
      
      setIsEditDialogOpen(false);
      toast({
        title: "Assignment updated",
        description: "The assignment has been updated successfully.",
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: `Failed to update assignment: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting assignment with ID:", id);
      const { data, error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Delete error from Supabase:", error);
        throw error;
      }
      
      console.log("Delete response:", data);
      return id;
    },
    onSuccess: (id) => {
      console.log("Assignment deleted successfully, ID:", id);
      console.log("Invalidating and refetching queries");
      
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.refetchQueries({ queryKey: ['assignments'] });
      
      queryClient.invalidateQueries({ queryKey: ['assignments-last-7-days'] });
      queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['photographer-completed-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
      
      setIsDeleteDialogOpen(false);
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: `Failed to delete assignment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

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
    updateAssignmentMutation.mutate(updatedAssignment);
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
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Showing {assignments.length} of {totalCount} assignments {shouldSearch && <span className="ml-2 font-medium">Search: "{searchQuery}"</span>}
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
              : "No assignments found. Create a new assignment to get started."}
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
