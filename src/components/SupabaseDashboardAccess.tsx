
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SUPABASE_PROJECT_ID = "ynbwhrvvpcgoowwtnpbp";

export function SupabaseDashboardAccess() {
  const baseUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`;
  
  const dashboardLinks = [
    { name: "Database", path: "/editor", icon: "📊" },
    { name: "Table Editor", path: "/editor", icon: "🗃️" },
    { name: "Authentication", path: "/auth/users", icon: "🔐" },
    { name: "Storage", path: "/storage/buckets", icon: "💾" },
    { name: "Edge Functions", path: "/functions", icon: "⚡" },
    { name: "Logs", path: "/logs/explorer", icon: "📝" },
    { name: "Settings", path: "/settings/general", icon: "⚙️" },
  ];

  const openDashboard = (path: string) => {
    window.open(`${baseUrl}${path}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white shadow-md dark:bg-gray-800">
          <span>Supabase</span>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Supabase Dashboard</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboardLinks.map((link) => (
          <DropdownMenuItem 
            key={link.path}
            onClick={() => openDashboard(link.path)}
            className="cursor-pointer"
          >
            <span className="mr-2">{link.icon}</span>
            {link.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
