
import {
  Calendar,
  Home,
  Plus,
  BarChart,
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
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Overview", icon: Home, path: "/" },
  { title: "Photographers", icon: Users, path: "/?tab=photographers" },
  { title: "New Assignment", icon: Plus, path: "/?tab=new" },
  { title: "Calendar", icon: Calendar, path: "/calendar" },
  { title: "Analytics", icon: BarChart, path: "/?tab=analytics" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
