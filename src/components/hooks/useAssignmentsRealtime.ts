
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAssignmentsRealtime = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up real-time subscription for assignments");
    
    const channel = supabase
      .channel('assignments-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Received real-time update for assignments:", payload);
          
          // Invalidate and refetch assignments queries
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          
          // Show toast notification
          toast({
            title: "Assignment updated",
            description: "Assignment data has been updated",
            duration: 2000
          });
        }
      )
      .subscribe();

    console.log("Subscribed to real-time updates for assignments");

    return () => {
      console.log("Unsubscribing from assignments real-time updates");
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
};
