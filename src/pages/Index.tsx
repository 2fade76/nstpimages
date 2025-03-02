
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

  // Subscribe to changes in the assignments table with improved error handling
  useEffect(() => {
    console.log("Setting up real-time subscription on Index component");
    
    // Create a more reliable channel with status callback
    const channel = supabase
      .channel('assignments-index-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Index component received real-time update:", payload);
          
          // Use a notification so the user knows data was updated
          toast.info("Assignment data updated", {
            position: "bottom-right"
          });
          
          // Force immediate refetch with logging
          console.log("Invalidating assignments queries");
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          
          console.log("Refetching assignments queries");
          queryClient.refetchQueries({ 
            queryKey: ['assignments'],
            type: 'active'
          });
          
          // Also refresh the analytics data
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
            <AssignmentsList onStatusUpdate={() => {
              console.log("Assignment status updated, forcing refresh");
              queryClient.invalidateQueries({ queryKey: ['assignments'] });
              queryClient.refetchQueries({ queryKey: ['assignments'] });
            }} />
          </TabsContent>

          <TabsContent value="photographers">
            <PhotographersMenu />
          </TabsContent>

          <TabsContent value="new">
            <AssignmentForm onAssignmentCreated={() => {
              // Show feedback and switch to assignments tab
              toast.success("Assignment created successfully");
              setActiveTab("assignments");
              
              // Force data refresh
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
