import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopPhotographer {
  id: string;
  name: string;
  completedCount: number;
  rank: number;
}

interface AssignmentWithPhotographer {
  id: string;
  status: string;
  photographer_id: string;
  photographers: {
    id: string;
    name: string;
  } | null;
}

export function useTopPhotographers() {
  return useQuery({
    queryKey: ["top-photographers"],
    queryFn: async () => {
      // Fetch completed assignments with photographer info
      const { data, error } = await supabase
        .from("assignments")
        .select("id, status, photographer_id, photographers(id, name)")
        .eq("status", "complete");

      if (error) throw error;

      // Count completions by photographer
      const photographerCounts: Record<
        string,
        { id: string; name: string; count: number }
      > = {};

      (data as AssignmentWithPhotographer[]).forEach((assignment) => {
        const photographerId = assignment.photographer_id;
        const photographerName = assignment.photographers?.name || "Unknown";
        const photographerDbId = assignment.photographers?.id || photographerId;

        if (!photographerCounts[photographerId]) {
          photographerCounts[photographerId] = {
            id: photographerDbId,
            name: photographerName,
            count: 0,
          };
        }
        photographerCounts[photographerId].count += 1;
      });

      // Sort and rank
      const sortedPhotographers = Object.values(photographerCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((p, index) => ({
          id: p.id,
          name: p.name,
          completedCount: p.count,
          rank: index + 1,
        }));

      return sortedPhotographers as TopPhotographer[];
    },

    // React Query behavior
    staleTime: 0, // always fresh
    gcTime: 1000 * 60 * 5, // keep cached briefly
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
