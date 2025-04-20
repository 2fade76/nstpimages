import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AssignmentWithPhotographer } from "@/types/assignments";
import { useToast } from "./use-toast";

export const useAssignments = (searchQuery: string = "", photographerId: string | null = null) => {
  const shouldSearch = Boolean(searchQuery?.trim());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ['assignments', searchQuery, photographerId],
    queryFn: async () => {
      console.log("Fetching assignments data", 
        shouldSearch ? `with search: ${searchQuery}` : "without search",
        photographerId ? `for photographer: ${photographerId}` : "for all photographers"
      );
      
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
        query = query.or(`title.ilike.${searchTerm},location.ilike.${searchTerm}`);
      }

      if (photographerId) {
        query = query.eq('photographer_id', photographerId);
      }
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
      
      return data as AssignmentWithPhotographer[];
    },
    enabled: !shouldSearch || Boolean(searchQuery?.trim()) || Boolean(photographerId),
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: Partial<AssignmentWithPhotographer>) => {
      if (!assignmentData.id) {
        throw new Error("No valid assignment ID for update");
      }
      
      const { data, error } = await supabase
        .from('assignments')
        .update(assignmentData)
        .eq('id', assignmentData.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({
        title: "Assignment updated",
        description: "The assignment has been updated successfully.",
        duration: 5000,
      });
    },
    onError: (error) => {
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
      const { data, error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({
        title: "Assignment deleted",
        description: "The assignment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete assignment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    assignments,
    isLoading,
    refetch,
    updateAssignment: updateAssignmentMutation.mutate,
    deleteAssignment: deleteAssignmentMutation.mutate,
    isUpdating: updateAssignmentMutation.isPending,
    isDeleting: deleteAssignmentMutation.isPending,
  };
};
