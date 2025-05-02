
import { AppSidebar } from "@/components/AppSidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/MobileHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { open } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className={`flex-1 transition-all ${open ? 'md:ml-[240px]' : 'md:ml-0'}`}>
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm md:hidden border-b dark:border-slate-800">
          <MobileHeader />
        </div>
        <div className="container py-4 md:py-6 px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
