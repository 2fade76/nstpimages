
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("assignments");
  const queryClient = useQueryClient();

  // Subscribe to changes in the assignments table
  useEffect(() => {
    console.log("Setting up real-time subscription on Index component");
    const channel = supabase
      .channel('assignments-index-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        () => {
          console.log("Index component received real-time update, refreshing data");
          // Force immediate refetch
          queryClient.invalidateQueries({ queryKey: ['assignments'] });
          queryClient.refetchQueries({ queryKey: ['assignments'] });
        }
      )
      .subscribe();

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
            <AssignmentForm onAssignmentCreated={() => setActiveTab("assignments")} />
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
