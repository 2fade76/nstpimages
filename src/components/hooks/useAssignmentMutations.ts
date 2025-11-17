
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";

interface UseAssignmentMutationsProps {
  onStatusUpdate?: () => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  toast: any;
  queryClient: ReturnType<typeof useQueryClient>;
}

export const useAssignmentMutations = ({
  onStatusUpdate,
  setIsEditDialogOpen,
  setIsDeleteDialogOpen,
  toast,
  queryClient
}: UseAssignmentMutationsProps) => {
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ assignment: assignmentData, currentAssignment }: { 
      assignment: Partial<Assignment>, 
      currentAssignment: (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) | null 
    }) => {
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
          status: assignmentData.status,
          category: assignmentData.category
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

  return {
    updateAssignmentMutation,
    deleteAssignmentMutation
  };
};
