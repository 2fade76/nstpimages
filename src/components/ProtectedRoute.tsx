
import React from 'react';
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        setIsAdmin(!!data);
      }
      setAdminLoading(false);
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  if (loading || adminLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
