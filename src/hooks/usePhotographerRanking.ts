import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PhotographerRankingItem {
  name: string;
  total: number;
}

export const usePhotographerRanking = () => {
  return useQuery({
    queryKey: ["photographer-ranking"],
    queryFn: async (): Promise<PhotographerRankingItem[]> => {
      console.log("Fetching photographer ranking data...");
      
      // Fetch all completed assignments with photographer information
      const { data: assignments, error } = await supabase
        .from("assignments")
        .select(`
          id,
          photographer_id,
          photographers!inner (
            id,
            name
          )
        `)
        .eq("status", "complete");

      if (error) {
        console.error("Error fetching completed assignments:", error);
        throw error;
      }

      console.log("Fetched completed assignments:", assignments);

      // Group by photographer name and count assignments
      const photographerCounts = new Map<string, number>();
      
      assignments?.forEach((assignment) => {
        const photographerName = assignment.photographers?.name;
        if (photographerName) {
          const currentCount = photographerCounts.get(photographerName) || 0;
          photographerCounts.set(photographerName, currentCount + 1);
        }
      });

      // Convert to array and sort by total (descending)
      const result = Array.from(photographerCounts.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);

      console.log("Photographer ranking result:", result);
      return result;
    },
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: false,
  });
};