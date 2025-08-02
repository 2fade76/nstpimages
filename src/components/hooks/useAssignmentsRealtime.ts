
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

let globalRealtimeChannel: any = null;

export const useAssignmentsRealtime = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Prevent multiple subscriptions by checking if one already exists
    if (globalRealtimeChannel) {
      console.log("Real-time subscription already exists, skipping setup");
      return;
    }

    console.log("Setting up real-time subscription for assignments");
    
    const channel = supabase
      .channel('assignments-realtime-unique')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Received real-time update for assignments:", payload);
          
          // Invalidate and refetch assignments queries with more specific targeting
          queryClient.invalidateQueries({ 
            queryKey: ['assignments'],
            exact: false 
          });
          
          // Also invalidate analytics queries
          queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
          queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
          queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
          queryClient.invalidateQueries({ queryKey: ['today-completed-assignments'] });
          
          // Show toast notification based on event type
          const eventType = payload.eventType;
          let message = "Assignment data has been updated";
          
          if (eventType === 'INSERT') {
            message = "New assignment created";
          } else if (eventType === 'UPDATE') {
            message = "Assignment updated";
          } else if (eventType === 'DELETE') {
            message = "Assignment deleted";
          }
          
          toast({
            title: "Real-time Update",
            description: message,
            duration: 3000
          });
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to assignments real-time updates");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error in real-time subscription for assignments");
        }
      });

    globalRealtimeChannel = channel;
    console.log("Subscribed to real-time updates for assignments");

    return () => {
      console.log("Unsubscribing from assignments real-time updates");
      if (globalRealtimeChannel) {
        supabase.removeChannel(globalRealtimeChannel);
        globalRealtimeChannel = null;
      }
    };
  }, [queryClient, toast]);
};
