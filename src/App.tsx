
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const queryClient = new QueryClient();

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {/* Global Search Button */}
        <div className="fixed top-4 right-4 z-50">
          <Button 
            variant="outline" 
            onClick={() => setIsSearchOpen(true)}
            className="rounded-full bg-white shadow-md dark:bg-gray-800 flex items-center gap-2 px-3"
          >
            <Search className="h-[1.2rem] w-[1.2rem]" />
            <span>Search</span>
          </Button>
        </div>
        
        {/* Search Dialog */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Search Assignments</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 pt-4">
              <div className="grid flex-1 gap-2">
                <Input
                  type="text"
                  placeholder="Search for assignments or photographers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter keywords to search for assignments or photographers
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calendar" element={<Calendar />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
