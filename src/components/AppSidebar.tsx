
import {
  Calendar,
  Home,
  Plus,
  BarChart2,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { title: "Overview", icon: Home, path: "/" },
  { title: "New Assignment", icon: Plus, path: "/?tab=new" },
  { title: "Photographers", icon: Users, path: "/photographers" }, // Moved to be after New Assignment
  { title: "Calendar", icon: Calendar, path: "/calendar" },
  { title: "Analytics", icon: BarChart2, path: "/analytics" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

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

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.path)}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
