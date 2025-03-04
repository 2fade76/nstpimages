import { DashboardLayout } from "@/components/DashboardLayout";
import { AssignmentsList } from "@/components/AssignmentsList";
import { AssignmentForm } from "@/components/AssignmentForm";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { PhotographersMenu } from "@/components/PhotographersMenu";
import { AnalyticsSummaryCard } from "@/components/AnalyticsSummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up real-time subscription on Index component");
    
    const channel = supabase
      .channel('assignments-index-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Index component received real-time update:", payload);
          
          toast.info("Assignment data updated", {
            position: "bottom-right"
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
        }
      });

    return () => {
      console.log("Cleaning up real-time subscription on Index component");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
    
    toast.success("Assignment status updated", {
      position: "bottom-right",
      description: "All data has been refreshed"
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
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
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="new">New Assignment</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <AssignmentsList onStatusUpdate={handleAssignmentStatusUpdate} />
          </TabsContent>

          <TabsContent value="photographers">
            <PhotographersMenu />
          </TabsContent>

          <TabsContent value="new">
            <AssignmentForm onAssignmentCreated={() => {
              toast.success("Assignment created successfully");
              setActiveTab("assignments");
              
              queryClient.invalidateQueries({ queryKey: ['assignments'] });
              queryClient.refetchQueries({ queryKey: ['assignments'] });
            }} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
