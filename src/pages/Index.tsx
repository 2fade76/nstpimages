
import { DashboardLayout } from "@/components/DashboardLayout";
import { AssignmentsList } from "@/components/AssignmentsList";
import { AssignmentForm } from "@/components/AssignmentForm";
import { AnalyticsSummaryCard } from "@/components/AnalyticsSummaryCard";
import { AssignmentsProvider, useAssignments } from "@/providers/AssignmentsProvider";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

const IndexContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'complete' | 'today-complete'>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const currentTab = urlParams.get("tab") || "overview";
  
  // Use the consolidated assignments context
  const { isConnected, isReconnecting, reconnect } = useAssignments();

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(location.search);
    if (value === "overview") {
      newParams.delete("tab");
    } else {
      newParams.set("tab", value);
    }
    navigate({ search: newParams.toString() });
  };

  const handleFilterChange = (filter: 'all' | 'open' | 'complete' | 'today-complete') => {
    console.log("Filter changed to:", filter);
    setStatusFilter(filter);
    // Removed toast - visual feedback is sufficient
  };

  // Real-time subscriptions are now handled by AssignmentsProvider

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
    // Search is now automatic via debouncing - no action needed
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return <DashboardLayout>
      <div className="space-y-8">
        {!isConnected && <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Unable to connect to Supabase. Some features may not work correctly.</span>
              <Button variant="outline" size="sm" onClick={reconnect} disabled={isReconnecting} className="flex items-center gap-2">
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
                <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
              </Button>
            </AlertDescription>
          </Alert>}
      
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold tracking-tight px-[10px] text-slate-950">Photo HQ Assignment Tracker Dashboard</h1>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Input
                placeholder="Search title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[280px] pr-8"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
        
        <Tabs defaultValue={currentTab} onValueChange={handleTabChange} value={currentTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="new">New Assignment</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-8">
            <AnalyticsSummaryCard 
              onFilterChange={handleFilterChange}
              activeFilter={statusFilter}
            />
            <AssignmentsList 
              onStatusUpdate={handleAssignmentStatusUpdate} 
              searchQuery={debouncedSearchQuery}
              isSearchActive={false}
              onSearchComplete={() => {}}
              statusFilter={statusFilter}
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

const Index = () => {
  return (
    <AssignmentsProvider>
      <IndexContent />
    </AssignmentsProvider>
  );
};

export default Index;
