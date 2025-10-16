import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { notificationManager } from "@/lib/notificationManager";

interface AssignmentsContextType {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnect: () => Promise<void>;
}

const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

interface AssignmentsProviderProps {
  children: ReactNode;
}

export const AssignmentsProvider = ({ children }: AssignmentsProviderProps) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const verifyConnection = async () => {
    try {
      const { error } = await supabase.from('assignments').select('id').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error.message);
        return false;
      }
      
      console.log('Supabase connection verified successfully');
      return true;
    } catch (err) {
      console.error('Failed to verify Supabase connection:', err);
      return false;
    }
  };

  const reconnect = async () => {
    setIsReconnecting(true);
    const connected = await verifyConnection();
    setIsConnected(connected);
    
    if (connected) {
      queryClient.invalidateQueries();
      toast({
        title: "Connection restored",
        description: "Successfully connected to Supabase",
        duration: 3000
      });
    }
    setIsReconnecting(false);
  };

  useEffect(() => {
    console.log("Setting up consolidated real-time subscription for assignments");
    
    const assignmentsChannel = supabase
      .channel('assignments-global-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Received real-time update for assignments:", payload);
          
          // Selective query invalidation based on event type
          const eventType = payload.eventType;
          
          // Always invalidate the main assignments list
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          
          // Invalidate dashboard trends for all events
          queryClient.invalidateQueries({ queryKey: ['dashboard-trends'] });
          
          if (eventType === 'INSERT' || eventType === 'DELETE') {
            // New or deleted assignment affects totals and analytics
            queryClient.invalidateQueries({ queryKey: ['assignments-this-month'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-completions-total'] });
          }
          
          if (eventType === 'UPDATE') {
            // Status changes affect completion data
            const oldStatus = payload.old?.status;
            const newStatus = payload.new?.status;
            
            if (oldStatus !== newStatus) {
              queryClient.invalidateQueries({ queryKey: ['completed-assignments-by-date'] });
              queryClient.invalidateQueries({ queryKey: ['top-photographers'] });
              queryClient.invalidateQueries({ queryKey: ['monthly-completions-total'] });
            }
          }
          
          // Throttled toast notifications - only show user-initiated actions
          if (notificationManager.canShow('assignment-realtime')) {
            let message = "Assignment data updated";
            
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
              duration: 2000
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Assignments real-time subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to assignments real-time updates");
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error("Error in real-time subscription for assignments");
          setIsConnected(false);
        }
      });

    const photographersChannel = supabase
      .channel('photographers-global-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photographers' }, 
        (payload) => {
          console.log("Received real-time update for photographers:", payload);
          
          // Only invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['photographers'] });
          
          // Only invalidate assignments if photographer data affects it
          if (payload.eventType === 'DELETE') {
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            queryClient.invalidateQueries({ queryKey: ['top-photographers'] });
          }
          
          // Throttled notifications for photographer changes
          if (notificationManager.canShow('photographer-realtime')) {
            toast({
              title: "Photographer Updated",
              description: "Photographer information changed",
              duration: 1500
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Photographers real-time subscription status:", status);
      });

    // Initial connection check
    verifyConnection().then(setIsConnected);

    return () => {
      console.log("Cleaning up consolidated real-time subscriptions");
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(photographersChannel);
    };
  }, [queryClient, toast]);

  const value = {
    isConnected,
    isReconnecting,
    reconnect
  };

  return (
    <AssignmentsContext.Provider value={value}>
      {children}
    </AssignmentsContext.Provider>
  );
};

export const useAssignments = () => {
  const context = useContext(AssignmentsContext);
  if (context === undefined) {
    throw new Error('useAssignments must be used within an AssignmentsProvider');
  }
  return context;
};