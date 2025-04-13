
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

type SortField = 'date' | 'status' | 'photographer';
type SortDirection = 'asc' | 'desc';
type AssignmentWithPhotographer = Assignment & { photographers: Pick<Photographer, 'id' | 'name'> };

export const useAssignments = (
  searchQuery: string = "",
  isSearchActive: boolean = false,
  onStatusUpdate?: () => void,
  onSearchComplete?: () => void
) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const shouldSearch = Boolean(searchQuery?.trim());

  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ['assignments', searchQuery],
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
        `);
        
      if (shouldSearch) {
        const searchTerm = `%${searchQuery.trim().toLowerCase()}%`;
        query = query
          .or(`title.ilike.${searchTerm},location.ilike.${searchTerm}`)
          .order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
      
      console.log("Assignments data fetched:", data?.length || 0, "records");
      
      if (onSearchComplete) {
        onSearchComplete();
      }
      
      return data as AssignmentWithPhotographer[];
    },
    enabled: !isSearchActive || shouldSearch,
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    console.log(`Sorting changed to ${field} in ${sortDirection === 'asc' ? 'desc' : 'asc'} order`);
  };

  const sortedAssignments = useMemo(() => {
    if (!assignments) return [];
    
    console.log(`Sorting assignments by ${sortField} in ${sortDirection} order`);
    
    return [...assignments].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        comparison = dateA - dateB;
      } 
      else if (sortField === 'status') {
        const statusOrder = { 'open': 0, 'progress': 1, 'complete': 2, 'cancel': 3 };
        comparison = (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                    (statusOrder[b.status as keyof typeof statusOrder] || 0);
      }
      else if (sortField === 'photographer') {
        comparison = a.photographers.name.localeCompare(b.photographers.name);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [assignments, sortField, sortDirection]);

  const updateAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: Partial<Assignment> & { id: string }) => {
      console.log("Updating assignment with data:", assignmentData);
      
      if (assignmentData.status && !['open', 'complete', 'cancelled'].includes(assignmentData.status)) {
        throw new Error(`Invalid status: ${assignmentData.status}`);
      }
      
      console.log(`Updating assignment ID: ${assignmentData.id} with status: ${assignmentData.status}`);
      
      const { id, ...updateData } = assignmentData;
      
      const { data, error } = await supabase
        .from('assignments')
        .update(updateData)
        .eq('id', id)
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

  return {
    assignments: sortedAssignments,
    isLoading,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    updateAssignmentMutation,
    deleteAssignmentMutation
  };
};
