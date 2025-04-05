
import React from "react";
import { Menu, Camera, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";

export const MobileHeader = () => {
  const { toggleSidebar, setOpenMobile } = useSidebar();
  
  const handleOpenMenu = () => {
    setOpenMobile(true);
  };

  return (
    <header className="flex items-center justify-between p-4 border-b md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={handleOpenMenu}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      
      <div className="flex items-center">
        <Camera className="h-6 w-6 text-primary mr-2" />
        <span className="font-semibold">NSTP PHOTO UNIT</span>
      </div>

      <Button variant="ghost" size="icon" onClick={() => {}}>
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
    </header>
  );
};
