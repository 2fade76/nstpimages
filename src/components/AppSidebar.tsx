
import { Calendar, Home, Plus, BarChart2, Settings, Users, Camera, LogIn, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppSidebar() {
  const location = useLocation();
  const { user, profile, roles, signOut, isAdmin, isEditor } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  // Define menu items based on user roles
  const menuItems = [
    {
      title: "Overview",
      icon: Home,
      path: "/",
      roles: ["admin", "editor", "user"],
    },
    {
      title: "New Assignment",
      icon: Plus,
      path: "/?tab=new",
      roles: ["admin", "editor"],
    },
    {
      title: "Photographers",
      icon: Users,
      path: "/photographers",
      roles: ["admin", "editor", "user"],
    },
    {
      title: "Calendar",
      icon: Calendar,
      path: "/calendar",
      roles: ["admin", "editor", "user"],
    },
    {
      title: "Analytics",
      icon: BarChart2,
      path: "/analytics",
      roles: ["admin", "editor", "user"],
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
      roles: ["admin", "editor", "user"],
    },
  ];

  // Filter menu items based on user roles
  const filteredMenuItems = menuItems.filter(item => {
    if (isAdmin) return true;
    if (isEditor && item.roles.includes("editor")) return true;
    if (!isAdmin && !isEditor && item.roles.includes("user")) return true;
    return false;
  });

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
        
        {/* User profile section */}
        {user ? (
          <div className="px-4 py-3 mb-4 bg-slate-100 rounded-md mx-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.display_name || user.email || ""} />
                <AvatarFallback>{getInitials(profile?.display_name || user.email)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.display_name || user.email?.split('@')[0]}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roles.map(role => (
                    <Badge key={role} variant="outline" className="text-xs px-1 py-0">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 mb-4 mx-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/auth" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          </div>
        )}
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs sm:text-sm">NSTP PHOTO UNIT</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map(item => <SidebarMenuItem key={item.title}>
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
        
        {user && (
          <div className="mt-auto pt-4 px-4">
            <Button variant="ghost" onClick={signOut} className="w-full flex items-center gap-2 text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Sign Out</span>
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>;
}
