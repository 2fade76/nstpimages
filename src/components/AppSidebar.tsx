
import {
  Calendar,
  Home,
  Plus,
  BarChart,
  Settings,
  Menu,
  User,
  UserCheck,
  Clock,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useState } from "react";
import { PhotographerInfoDialog } from "./PhotographerInfoDialog";

const menuItems = [
  { title: "Overview", icon: Home, path: "/" },
  { title: "New Assignment", icon: Plus, path: "/new" },
  { title: "Calendar", icon: Calendar, path: "/calendar" },
  { title: "Analytics", icon: BarChart, path: "/analytics" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

// Mock photographers data - in a real app, this would come from an API
const photographers = [
  { name: "John Smith", status: "active", assignments: 12 },
  { name: "Sarah Johnson", status: "busy", assignments: 8 },
  { name: "Michael Brown", status: "available", assignments: 5 },
  { name: "Emma Wilson", status: "active", assignments: 10 },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "busy":
      return Clock;
    case "available":
      return User;
    default:
      return UserCheck;
  }
};

export function AppSidebar() {
  const [selectedPhotographer, setSelectedPhotographer] = useState<string | null>(
    null
  );

  return (
    <>
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

          <SidebarGroup>
            <SidebarGroupLabel>Photographers</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {photographers.map((photographer) => {
                  const StatusIcon = getStatusIcon(photographer.status);
                  return (
                    <SidebarMenuItem key={photographer.name}>
                      <SidebarMenuButton
                        onClick={() => setSelectedPhotographer(photographer.name)}
                      >
                        <StatusIcon className="h-5 w-5" />
                        <span>{photographer.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {selectedPhotographer && (
        <PhotographerInfoDialog
          isOpen={true}
          onClose={() => setSelectedPhotographer(null)}
          photographer={selectedPhotographer}
          assignments={
            photographers.find((p) => p.name === selectedPhotographer)
              ?.assignments || 0
          }
        />
      )}
    </>
  );
}
