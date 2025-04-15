
import { AppSidebar } from "@/components/AppSidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { UserMenu } from "@/components/UserMenu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className={`flex-1 transition-all ${isSidebarOpen ? 'md:ml-[240px]' : 'md:ml-0'}`}>
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm md:hidden border-b">
          <MobileHeader />
        </div>
        <div className="hidden md:flex w-full items-center justify-end p-4 border-b">
          <UserMenu />
        </div>
        <div className="container max-w-7xl py-4 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
