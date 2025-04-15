
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";

export function MobileHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      
      <UserMenu />
    </div>
  );
}
