
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type AppRole = "admin" | "editor" | "user";

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  isAdmin: boolean;
  isEditor: boolean;
  isUser: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, role: AppRole) => Promise<void>;
  refreshUserRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Fetch profile and roles only if we have a session
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
            fetchUserRoles(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        fetchUserRoles(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user roles:", error);
        return;
      }

      const userRoles = data.map(item => item.role as AppRole);
      setRoles(userRoles);
    } catch (error) {
      console.error("Error in fetchUserRoles:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error);
        toast.error("Failed to sign in with Google");
      }
    } catch (error) {
      console.error("Error in signInWithGoogle:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Failed to sign out");
        return;
      }
      
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error in signOut:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const updateUserRole = async (userId: string, role: AppRole) => {
    try {
      // Check if the role already exists for this user
      const { data: existingRoles, error: fetchError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", role);

      if (fetchError) {
        console.error("Error checking existing roles:", fetchError);
        toast.error("Failed to update user role");
        return;
      }

      // If role doesn't exist, add it
      if (existingRoles.length === 0) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (insertError) {
          console.error("Error adding role:", insertError);
          toast.error("Failed to update user role");
          return;
        }
      } else {
        // Role already exists, nothing to do
        toast.info("User already has this role");
        return;
      }

      toast.success(`Role ${role} added successfully`);
      
      // Refresh current user's roles if we're updating their roles
      if (userId === user?.id) {
        await fetchUserRoles(userId);
      }
    } catch (error) {
      console.error("Error in updateUserRole:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const refreshUserRoles = async () => {
    if (user) {
      await fetchUserRoles(user.id);
    }
  };

  const value = {
    session,
    user,
    profile,
    roles,
    isAdmin: roles.includes("admin"),
    isEditor: roles.includes("editor") || roles.includes("admin"),
    isUser: roles.includes("user") || roles.includes("editor") || roles.includes("admin"),
    isLoading,
    signInWithGoogle,
    signOut,
    updateUserRole,
    refreshUserRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
