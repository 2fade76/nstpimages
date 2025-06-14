
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "./ThemeToggle";

export function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center justify-between px-3 py-3 min-h-[60px]">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="h-10 w-10 touch-manipulation"
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
