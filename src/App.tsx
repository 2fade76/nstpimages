
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Assignment, Photographer } from '@/types/database';
import { toast } from "sonner";

const queryClient = new QueryClient();

const SearchResults = ({ 
  results, 
  onClose 
}: { 
  results: Array<{ type: 'assignment' | 'photographer', data: any }>,
  onClose: () => void 
}) => {
  const navigate = useNavigate();

  if (results.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No results found</p>;
  }

  const handleSelect = (item: any, type: 'assignment' | 'photographer') => {
    onClose();
    if (type === 'assignment') {
      // Just close for now and highlight in the main list
      // Future enhancement: Navigate to specific assignment view
    } else if (type === 'photographer') {
      // Future enhancement: Navigate to photographer profile
    }
  };

  return (
    <div className="max-h-[60vh] overflow-y-auto space-y-2">
      {results.map((item, index) => (
        <Card 
          key={index} 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => handleSelect(item.data, item.type)}
        >
          <CardContent className="p-4">
            {item.type === 'assignment' && (
              <div>
                <div className="flex justify-between">
                  <h3 className="font-medium">{item.data.title || 'Untitled Assignment'}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Assignment</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.data.location || 'No location'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Date: {item.data.date ? new Date(item.data.date).toLocaleDateString() : 'No date'}
                  {item.data.photographers && (
                    <span className="ml-2">
                      Photographer: {item.data.photographers.name}
                    </span>
                  )}
                </p>
              </div>
            )}
            
            {item.type === 'photographer' && (
              <div>
                <div className="flex justify-between">
                  <h3 className="font-medium">{item.data.name || 'Unnamed Photographer'}</h3>
                  <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">Photographer</span>
                </div>
                {item.data.email && (
                  <p className="text-sm text-muted-foreground mt-1">{item.data.email}</p>
                )}
                {item.data.status && (
                  <p className="text-xs text-muted-foreground mt-1">Status: {item.data.status}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// This is a wrapper component to ensure we have access to the useNavigate hook
const AppContent = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ type: 'assignment' | 'photographer', data: any }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  useEffect(() => {
    console.log("Setting up global real-time subscription for all tables");
    
    const channel = supabase
      .channel('global-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log("Global subscription - Assignment change detected:", payload);
          toast.success("Assignment data updated", { 
            description: "The assignments list will refresh automatically", 
            position: "bottom-right"
          });
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photographers' }, 
        (payload) => {
          console.log("Global subscription - Photographer change detected:", payload);
          toast.success("Photographer data updated", { 
            description: "The photographers list will refresh automatically", 
            position: "bottom-right"
          });
        }
      )
      .subscribe((status) => {
        console.log("Global realtime subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to all database changes");
        }
      });

    return () => {
      console.log("Cleaning up global real-time subscription");
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length > 0 && isSearchOpen) {
        setIsSearching(true);
        setSearchResults([]);
        
        try {
          // Search assignments
          const { data: assignmentsData, error: assignmentsError } = await supabase
            .from('assignments')
            .select(`
              *,
              photographers:photographer_id(id, name)
            `)
            .or(`
              title.ilike.%${searchQuery}%,
              location.ilike.%${searchQuery}%
            `);
            
          if (assignmentsError) {
            console.error("Error searching assignments:", assignmentsError);
          }
          
          // Search photographers
          const { data: photographersData, error: photographersError } = await supabase
            .from('photographers')
            .select('*')
            .or(`
              name.ilike.%${searchQuery}%,
              email.ilike.%${searchQuery}%
            `);
            
          if (photographersError) {
            console.error("Error searching photographers:", photographersError);
          }
          
          // Combine results with null checks
          const combinedResults = [
            ...(assignmentsData || []).map((item) => ({ type: 'assignment' as const, data: item })),
            ...(photographersData || []).map((item) => ({ type: 'photographer' as const, data: item }))
          ];
          
          setSearchResults(combinedResults);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // Debounce search for better performance
    
    return () => clearTimeout(searchTimeout);
  }, [searchQuery, isSearchOpen]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button 
          variant="outline" 
          onClick={() => setIsSearchOpen(true)}
          className="rounded-full bg-white shadow-md dark:bg-gray-800 flex items-center gap-2 px-3"
          type="button"
        >
          <Search className="h-[1.2rem] w-[1.2rem]" />
          <span>Search</span>
        </Button>
      </div>
      
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search Assignments and Photographers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  type="text"
                  placeholder="Search for assignments, photographers, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  Enter keywords to search for assignments, locations, or photographers
                </p>
              </div>
            </div>
            
            {isSearching ? (
              <div className="py-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : (
              <SearchResults results={searchResults} onClose={handleCloseSearch} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
