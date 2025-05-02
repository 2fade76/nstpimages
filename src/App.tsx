
import React, { useState, useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CommandDialog } from "@/components/CommandDialog";
import { AppRoutes } from "@/components/AppRoutes";
import { SupabaseDashboardAccess } from "@/components/SupabaseDashboardAccess";
import { ThemeProvider } from "@/providers/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider defaultOpen={true}>
          <TooltipProvider delayDuration={300}>
            <BrowserRouter>
              <CommandDialog isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
              <AppRoutes />
              <Toaster />
              <Sonner position="top-center" />
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
      <SupabaseDashboardAccess />
    </QueryClientProvider>
  );
};

export default App;
