import { Calendar, Home, Plus, BarChart2, Settings, Users, Camera, Search } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
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

  // Function to determine if a menu item is active
  const isActive = (path: string) => {
    // For the home page with no tab param
    if (path === "/" && location.pathname === "/" && !location.search) {
      return true;
    }

    // For tab-based navigation
    if (path.includes("?tab=") && location.search.includes(path.split("?")[1])) {
      return true;
    }

    // For direct routes like /calendar
    if (path !== "/" && location.pathname === path) {
      return true;
    }
    return false;
  };
  return <Sidebar>
      <SidebarContent className="bg-slate-200">
        {/* Logo Section - Only show in sidebar content, not in mobile view */}
        <div className="flex justify-center items-center py-3 sm:py-4 mb-2 hidden md:flex">
          <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm">NSTP PHOTO UNIT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.path)}>
                    <Link to={item.path} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}