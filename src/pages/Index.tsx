import { DashboardLayout } from "@/components/DashboardLayout";
import { AssignmentsList } from "@/components/AssignmentsList";
import { AssignmentForm } from "@/components/AssignmentForm";
import { DashboardCompletionStats } from "@/components/DashboardCompletionStats";
import { DashboardCompletionTrend } from "@/components/DashboardCompletionTrend";
import { DashboardCategoryDistribution } from "@/components/DashboardCategoryDistribution";
import { DashboardRankingCard } from "@/components/DashboardRankingCard";
import { AssignmentsProvider, useAssignments } from "@/providers/AssignmentsProvider";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

const IndexContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [instantQuery, setInstantQuery] = useState("");
  // The query actually used for fetching: instant (button/Enter) wins over debounced
  const effectiveQuery = instantQuery || debouncedSearchQuery;
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'complete' | 'today-complete'>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const currentTab = urlParams.get("tab") || "overview";

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
    setStatusFilter(filter);
  };

  const handleAssignmentStatusUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
    queryClient.refetchQueries({ queryKey: ['assignments'], type: 'active' });
    queryClient.invalidateQueries({ queryKey: ['assignments-last-7-days'] });
    queryClient.invalidateQueries({ queryKey: ['completed-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['photographer-completed-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['completed-assignments-by-date'] });
    queryClient.invalidateQueries({ queryKey: ['total-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['open-assignments'] });
    toast({
      title: "Success",
      description: "Assignment status updated. All data has been refreshed",
      duration: 3000
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setInstantQuery(searchQuery);
  };

  const triggerSearchNow = () => {
    setInstantQuery(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setInstantQuery("");
  };

  // Keep instantQuery in sync as the user types so it always reflects the latest input
  // (matches the debounced/dynamic behavior of the input).
  // When typing, clear the instant override so debounced takes back over.
  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    if (instantQuery) setInstantQuery("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {!isConnected && (
          <Alert variant="destructive" className="animate-pulse">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Unable to connect to Supabase. Some features may not work correctly.</span>
              <Button variant="outline" size="sm" onClick={reconnect} disabled={isReconnecting} className="flex items-center gap-2">
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
                <RefreshCw className={`h-4 w-4 ${isReconnecting ? 'animate-spin' : ''}`} />
              </Button>
            </AlertDescription>
          </Alert>
        )}
      
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Assignment Tracker</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track, manage, and monitor photo assignments</p>
          </div>
          <form onSubmit={handleSearch} className="w-full sm:w-auto">
            <div className="relative">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                onClick={triggerSearchNow}
                aria-label="Search"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Input
                placeholder="Search title, location, photographer, category, status, date, time..."
                value={searchQuery}
                onChange={e => handleQueryChange(e.target.value)}
                className="w-full sm:w-[320px] pl-9 pr-8 bg-card border-border/40 rounded-xl"
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
          <TabsList className="bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="new" className="rounded-lg">New Assignment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Completion stats: Daily / Weekly / Monthly / YTD */}
            <DashboardCompletionStats />

            {/* Trend + Ranking + Category */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 order-1">
                <DashboardCompletionTrend />
              </div>
              <div className="lg:col-span-1 order-3 lg:order-2">
                <DashboardRankingCard />
              </div>
              <div className="lg:col-span-1 order-2 lg:order-3">
                <DashboardCategoryDistribution />
              </div>
            </div>

            {/* Current Assignments */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Current Assignments</h2>
              <AssignmentsList 
                onStatusUpdate={handleAssignmentStatusUpdate} 
                searchQuery={effectiveQuery} 
                isSearchActive={false} 
                onSearchComplete={() => {}} 
                statusFilter={statusFilter} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="new" className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold text-foreground">Create New Assignment</h2>
            <AssignmentForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const Index = () => {
  return (
    <AssignmentsProvider>
      <IndexContent />
    </AssignmentsProvider>
  );
};

export default Index;