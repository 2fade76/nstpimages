
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Photographers from "./pages/Photographers";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SupabaseDashboardAccess } from "./components/SupabaseDashboardAccess";
import { SidebarProvider } from "./components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search, X } from "lucide-react";

// Initialize the query client once
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1, // Number of retry attempts for failed queries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
  },
});

// Define pages for command palette
const pages = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Photographers",
    path: "/photographers",
  },
  {
    title: "New Assignment",
    path: "/?tab=new",
  },
  {
    title: "Calendar",
    path: "/calendar",
  },
  {
    title: "Analytics",
    path: "/analytics",
  },
  {
    title: "Settings",
    path: "/settings",
  },
];

// App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen={true}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter>
            <AppContent />
            <Toaster />
            <Sonner position="top-center" />
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

const AppContent = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  // When location changes, close search
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location]);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery("");
  };
  
  // Filter pages based on search query
  const filteredPages = pages.filter((page) => {
    if (!searchQuery) return true;
    return page.title.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Get command palette trigger positions
  const getTriggerPosition = () => {
    const commandTrigger = document.querySelector('[data-command-trigger="true"]');
    if (commandTrigger instanceof HTMLElement) {
      const rect = commandTrigger.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const top = rect.bottom + 8;
      
      // Check if the trigger is too close to the right edge
      const maxWidth = 500; // Max width of dialog
      const leftPos = Math.max(24, Math.min(centerX - maxWidth / 2, window.innerWidth - maxWidth - 24));
      
      return {
        style: {
          position: "fixed" as const,
          top: `${top}px`,
          left: `${leftPos}px`,
          width: `${Math.min(maxWidth, window.innerWidth - 48)}px`,
        },
      };
    }
    
    return {};
  };

  return (
    <>
      <button
        data-command-trigger="true"
        className="h-0 w-0 overflow-hidden"
        aria-label="Open command palette"
        onClick={() => setIsSearchOpen(true)}
      />
      
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent 
          className="p-0 gap-0 overflow-hidden"
          hideClose={true}
          {...getTriggerPosition()}
        >
          <Command className="rounded-lg" shouldFilter={false}>
            <div className="flex items-center border-b p-2 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput 
                placeholder="Search pages..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1 border-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
              />
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-7 w-7 rounded-full"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Pages">
                {filteredPages.map((page) => (
                  <CommandItem
                    key={page.path}
                    value={page.title}
                    onSelect={() => handleSelect(page.path)}
                    className="flex items-center gap-2 px-4 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span>{page.title}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
      
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/photographers" element={<Photographers />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <SupabaseDashboardAccess />
    </>
  );
};

export default App;
