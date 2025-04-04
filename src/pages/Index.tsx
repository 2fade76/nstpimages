
import { DashboardLayout } from "@/components/DashboardLayout";
import { AssignmentsList } from "@/components/AssignmentsList";
import { AssignmentForm } from "@/components/AssignmentForm";
import { AnalyticsSummaryCard } from "@/components/AnalyticsSummaryCard";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, verifySupabaseConnection } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const currentTab = urlParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(location.search);
    if (value === "overview") {
      newParams.delete("tab");
    } else {
      newParams.set("tab", value);
    }
    navigate({ search: newParams.toString() });
  };

  const checkConnection = async () => {
    setIsReconnecting(true);
    const isConnected = await verifySupabaseConnection();
    setConnectionError(!isConnected);
    if (isConnected) {
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
    checkConnection();
  }, []);

  useEffect(() => {
    console.log("Setting up real-time subscription on Index component");
    const channel = supabase.channel('assignments-index-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'assignments'
    }, payload => {
      console.log("Index component received real-time update:", payload);
      toast({
        title: "Assignment data updated",
        description: "Assignment data has been updated",
        duration: 3000
      });
      console.log("Invalidating assignments queries");
      queryClient.invalidateQueries({
        queryKey: ['assignments']
      });
      console.log("Refetching assignments queries");
      queryClient.refetchQueries({
        queryKey: ['assignments'],
        type: 'active'
      });
      console.log("Refreshing analytics data");
      queryClient.invalidateQueries({
        queryKey: ['assignments-last-7-days']
      });
      queryClient.invalidateQueries({
        queryKey: ['completed-assignments']
      });
      queryClient.invalidateQueries({
        queryKey: ['photographer-completed-assignments']
      });
      queryClient.invalidateQueries({
        queryKey: ['total-assignments']
      });
      queryClient.invalidateQueries({
        queryKey: ['open-assignments']
      });
    }).subscribe(status => {
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
    queryClient.invalidateQueries({
      queryKey: ['assignments']
    });
    queryClient.refetchQueries({
      queryKey: ['assignments'],
      type: 'active'
    });
    queryClient.invalidateQueries({
      queryKey: ['assignments-last-7-days']
    });
    queryClient.invalidateQueries({
      queryKey: ['completed-assignments']
    });
    queryClient.invalidateQueries({
      queryKey: ['photographer-completed-assignments']
    });
    queryClient.invalidateQueries({
      queryKey: ['completed-assignments-by-date']
    });
    queryClient.invalidateQueries({
      queryKey: ['total-assignments']
    });
    queryClient.invalidateQueries({
      queryKey: ['open-assignments']
    });
    toast({
      title: "Success",
      description: "Assignment status updated. All data has been refreshed",
      duration: 3000
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    console.log("Searching for:", searchQuery);
    
    if (searchQuery.trim() === "") {
      // If search is empty, clear search state
      setIsSearching(false);
      queryClient.invalidateQueries({
        queryKey: ['assignments']
      });
      toast({
        title: "Search cleared",
        description: "Showing all assignments",
        duration: 2000
      });
      return;
    }
    
    // Update the URL to include the search parameter
    const newParams = new URLSearchParams(location.search);
    newParams.set("search", searchQuery);
    navigate({ search: newParams.toString() });
    
    // We'll pass the search query to the AssignmentsList component
    toast({
      title: "Search",
      description: `Searching for: ${searchQuery}`,
      duration: 2000
    });
  };

  return <DashboardLayout>
      <div className="space-y-8">
        {connectionError && <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Unable to connect to Supabase. Some features may not work correctly.</span>
              <Button variant="outline" size="sm" onClick={checkConnection} disabled={isReconnecting} className="flex items-center gap-2">
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
                <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
              </Button>
            </AlertDescription>
          </Alert>}
      
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight px-[10px] text-slate-950">Photo HQ Assignment Tracker Dashboard</h1>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px]"
            />
            <Button type="submit" size="icon" variant="ghost" disabled={isSearching}>
              <Search className={`h-5 w-5 ${isSearching ? 'animate-spin' : ''}`} />
            </Button>
          </form>
        </div>
        
        <Tabs defaultValue={currentTab} onValueChange={handleTabChange} value={currentTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="new">New Assignment</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-8">
            <AnalyticsSummaryCard />
            <AssignmentsList 
              onStatusUpdate={handleAssignmentStatusUpdate} 
              searchQuery={searchQuery}
              isSearchActive={isSearching}
              onSearchComplete={() => setIsSearching(false)}
            />
          </TabsContent>
          <TabsContent value="new" className="space-y-4">
            <h2 className="text-2xl font-semibold">Create New Assignment</h2>
            <AssignmentForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>;
};

export default Index;
