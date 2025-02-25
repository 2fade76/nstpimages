
import { DashboardLayout } from "@/components/DashboardLayout";
import { AssignmentsList } from "@/components/AssignmentsList";
import { AssignmentForm } from "@/components/AssignmentForm";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { PhotographersMenu } from "@/components/PhotographersMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Photo Assignments Dashboard
          </h1>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="photographers">Photographers</TabsTrigger>
            <TabsTrigger value="new">New Assignment</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <AssignmentsList />
          </TabsContent>

          <TabsContent value="photographers">
            <PhotographersMenu />
          </TabsContent>

          <TabsContent value="new">
            <AssignmentForm />
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
