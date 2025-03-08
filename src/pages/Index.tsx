
import { DashboardLayout } from "@/components/DashboardLayout";
import { AssignmentsList } from "@/components/AssignmentsList";
import { AssignmentForm } from "@/components/AssignmentForm";
import { AnalyticsSummaryCard } from "@/components/AnalyticsSummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, verifySupabaseConnection } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const [connectionError, setConnectionError] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsReconnecting(true);
    const isConnected = await verifySupabaseConnection();
    setConnectionError(!isConnected);
    
    if (isConnected) {
      queryClient.invalidateQueries();
      toast({
        title: "Connection restored",
        description: "Successfully connected to Supabase",
        duration: 3000,
      });
    }
    setIsReconnecting(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    console.log("Setting up real-time subscription on Index component");
    
    const channel = supabase
      .channel('assignments-index-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Index component received real-time update:", payload);
          
          toast({
            title: "Assignment data updated",
            description: "Assignment data has been updated",
            duration: 3000,
          });
          
          console.log("Invalidating assignments queries");
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          
          console.log("Refetching assignments queries");
          queryClient.refetchQueries({ 
            queryKey: ['assignments'],
            type: 'active'
          });
          
          console.log("Refreshing analytics data");
          queryClient.invalidateQueries({ queryKey: ['assignments-last-7-days'] });
          queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
          queryClient.invalidateQueries({ queryKey: ['photographer-completed-assignments'] });
          queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
          queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to assignment changes");
          setConnectionError(false);
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error in real-time subscription");
          setConnectionError(true);
        } else if (status === 'TIMED_OUT') {
          console.error("Real-time subscription timed out");
          setConnectionError(true);
        }
      });

    return () => {
      console.log("Cleaning up real-time subscription on Index component");
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  const handleAssignmentStatusUpdate = () => {
    console.log("Assignment status updated in Index component, forcing refresh of all relevant queries");
    
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
    
    queryClient.refetchQueries({ 
      queryKey: ['assignments'],
      type: 'active'
    });
    
    queryClient.invalidateQueries({ queryKey: ['assignments-last-7-days'] });
    queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['photographer-completed-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['completed-assignments-by-date'] });
    queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
    
    toast({
      title: "Success",
      description: "Assignment status updated. All data has been refreshed",
      duration: 3000,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {connectionError && (
          <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Unable to connect to Supabase. Some features may not work correctly.</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkConnection}
                disabled={isReconnecting}
                className="flex items-center gap-2"
              >
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
                <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
              </Button>
            </AlertDescription>
          </Alert>
        )}
      
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Photo Assignment Tracker Dashboard
          </h1>
        </div>
        
        <AnalyticsSummaryCard />

        <Tabs 
          defaultValue="assignments" 
          className="space-y-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="new">New Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <AssignmentsList onStatusUpdate={handleAssignmentStatusUpdate} />
          </TabsContent>

          <TabsContent value="new">
            <AssignmentForm onAssignmentCreated={() => {
              toast({
                title: "Success",
                description: "Assignment created successfully",
                duration: 3000,
              });
              setActiveTab("assignments");
              
              queryClient.invalidateQueries({ queryKey: ['assignments'] });
              queryClient.refetchQueries({ queryKey: ['assignments'] });
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
