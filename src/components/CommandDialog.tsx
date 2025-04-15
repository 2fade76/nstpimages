
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from "lucide-react";
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CommandDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const pages = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "New Assignment",
    path: "/?tab=new",
  },
  {
    title: "Photographers",
    path: "/photographers",
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

export function CommandDialog({ isOpen, setIsOpen }: CommandDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setIsOpen(false);
  }, [location, setIsOpen]);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearchQuery("");
  };
  
  const filteredPages = pages.filter((page) => {
    if (!searchQuery.trim()) return true;
    return page.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  const getTriggerPosition = () => {
    const commandTrigger = document.querySelector('[data-command-trigger="true"]');
    if (commandTrigger instanceof HTMLElement) {
      const rect = commandTrigger.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const top = rect.bottom + 8;
      
      const maxWidth = 500;
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
        onClick={() => setIsOpen(true)}
      />
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="p-0 gap-0 overflow-hidden"
          hideCloseButton={true}
          {...getTriggerPosition()}
        >
          <Command className="rounded-lg">
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
                  onClick={() => setIsOpen(false)}
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
    </>
  );
}
