
import { Calendar, Home, Plus, BarChart2, Settings, Users, Moon, Sun } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";
import { DateTimeDisplay } from "./DateTimeDisplay";
import { ThemeToggle } from "./ThemeToggle";

const menuItems = [{
  title: "Overview",
  icon: Home,
  path: "/"
}, {
  title: "New Assignment",
  icon: Plus,
  path: "/?tab=new"
}, {
  title: "Photographers",
  icon: Users,
  path: "/photographers"
}, {
  title: "Calendar",
  icon: Calendar,
  path: "/calendar"
}, {
  title: "Analytics",
  icon: BarChart2,
  path: "/analytics"
}, {
  title: "Settings",
  icon: Settings,
  path: "/settings"
}];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/" && !location.search) {
      return true;
    }

    if (path.includes("?tab=") && location.search.includes(path.split("?")[1])) {
      return true;
    }

    if (path !== "/" && location.pathname === path) {
      return true;
    }
    return false;
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-slate-200 dark:bg-slate-900">
        <div className="flex flex-col justify-center items-center py-3 sm:py-4 mb-2 hidden md:flex">
          <img 
            src="/lovable-uploads/bb1c2738-cc8b-4894-bdba-c321f66338dd.png" 
            alt="NSTP Images Logo" 
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
          />
          <DateTimeDisplay />
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm">NSTP PHOTO UNIT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <Link to={item.path} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="bg-slate-200 dark:bg-slate-900 py-2 px-3 flex items-center justify-between">
        <ThemeToggle />
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
