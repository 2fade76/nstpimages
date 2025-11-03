import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopPhotographer {
  id: string;
  name: string;
  completedCount: number;
  rank: number;
}


export function useTopPhotographers() {
  return useQuery({
    queryKey: ["top-photographers"],
    queryFn: async () => {
      // Use the database function for efficient aggregation
      const { data, error } = await supabase
        .rpc("get_top_photographers", { limit_count: 10 });

      if (error) throw error;

      // Map the database result to our interface
      return (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        completedCount: Number(p.completed_count),
        rank: Number(p.rank),
      })) as TopPhotographer[];
    },

    // React Query behavior with better caching
    staleTime: 1000 * 60 * 2, // 2 minutes - reduce unnecessary refetches
    gcTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
