
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{user.email}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={signOut}
        className="hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
