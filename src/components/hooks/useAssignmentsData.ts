
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Assignment, Photographer } from "@/types/database";
import { format, startOfDay, endOfDay } from "date-fns";

interface UseAssignmentsDataProps {
  searchQuery: string;
  currentPage: number;
  sortField: 'date' | 'status' | 'photographer';
  sortDirection: 'asc' | 'desc';
  selectedPhotographerFilter: string | null;
  selectedCategoryFilter: string | null;
  statusFilter: 'all' | 'open' | 'complete' | 'today-complete';
  isSearchActive: boolean;
  onSearchComplete?: () => void;
}

const ITEMS_PER_PAGE = 10;

export const useAssignmentsData = ({
  searchQuery,
  currentPage,
  sortField,
  sortDirection,
  selectedPhotographerFilter,
  selectedCategoryFilter,
  statusFilter,
  isSearchActive,
  onSearchComplete
}: UseAssignmentsDataProps) => {
  const shouldSearch = Boolean(searchQuery?.trim());

  const { data: assignmentsData, isLoading, refetch } = useQuery({
    queryKey: ['assignments', searchQuery, currentPage, sortField, sortDirection, selectedPhotographerFilter, selectedCategoryFilter, statusFilter],
    queryFn: async () => {
      console.log("Fetching assignments data", shouldSearch ? `with search: ${searchQuery}` : "without search", `with status filter: ${statusFilter}`, `page: ${currentPage}`);
      
      let query = supabase
        .from('assignments')
        .select(`
          *,
          photographers (
            id,
            name
          )
        `, { count: 'exact' });
        
      if (shouldSearch) {
        const raw = searchQuery.trim();
        const searchTerm = `%${raw}%`;

        // Look up matching photographers by name so we can include their assignments.
        // Match on substring so partial names work (e.g. "shah" → "Shahril Badri").
        const { data: matchingPhotographers } = await supabase
          .from('photographers')
          .select('id')
          .ilike('name', searchTerm);
        const photographerIds = (matchingPhotographers || []).map((p) => p.id);

        // Always-on ilike across text columns
        const orFilters: string[] = [
          `title.ilike.${searchTerm}`,
          `location.ilike.${searchTerm}`,
          `status.ilike.${searchTerm}`,
        ];

        // Category is an enum — case-insensitive substring match against known values
        const categories = ['News', 'Sports', 'Entertainment'];
        const matchedCategories = categories.filter((c) =>
          c.toLowerCase().includes(raw.toLowerCase())
        );
        for (const c of matchedCategories) {
          orFilters.push(`category.eq.${c}`);
        }

        // Date — full YYYY-MM-DD exact, or partial YYYY / YYYY-MM range
        const fullDate = /^\d{4}-\d{2}-\d{2}$/.test(raw);
        const partialDate = /^\d{4}(-\d{2})?$/.test(raw);
        if (fullDate) {
          orFilters.push(`date.eq.${raw}`);
        } else if (partialDate) {
          // Use gte/lte range — but `or` supports gte/lte too
          const start = raw.length === 4 ? `${raw}-01-01` : `${raw}-01`;
          const endYear = raw.length === 4 ? `${raw}-12-31` : null;
          if (endYear) {
            // year range
            orFilters.push(`and(date.gte.${start},date.lte.${endYear})`);
          } else {
            // YYYY-MM — compute month end
            const [y, m] = raw.split('-').map(Number);
            const last = new Date(y, m, 0).getDate();
            orFilters.push(`and(date.gte.${start},date.lte.${raw}-${String(last).padStart(2, '0')})`);
          }
        }

        // Time — full HH:MM(:SS) exact match
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
          orFilters.push(`time.eq.${raw.length === 5 ? raw + ':00' : raw}`);
        }

        if (photographerIds.length > 0) {
          orFilters.push(`photographer_id.in.(${photographerIds.join(',')})`);
        }

        query = query.or(orFilters.join(','));
      }

      if (selectedPhotographerFilter) {
        query = query.eq('photographer_id', selectedPhotographerFilter);
      }

      if (selectedCategoryFilter) {
        query = query.eq('category', selectedCategoryFilter as 'News' | 'Sports' | 'Entertainment');
      }

      // Apply status filter
      if (statusFilter === 'open') {
        query = query.eq('status', 'open');
      } else if (statusFilter === 'complete') {
        query = query.eq('status', 'complete');
      } else if (statusFilter === 'today-complete') {
        const today = new Date();
        const startOfToday = startOfDay(today).toISOString();
        const endOfToday = endOfDay(today).toISOString();
        query = query
          .eq('status', 'complete')
          .gte('date', startOfToday)
          .lte('date', endOfToday);
      }
      
      // Fix the sorting logic - when sortDirection is 'desc', we want descending order (false for ascending)
      if (sortField === 'date') {
        query = query.order('date', { ascending: sortDirection === 'asc' });
      } else if (sortField === 'status') {
        query = query.order('status', { ascending: sortDirection === 'asc' });
      } else if (sortField === 'photographer') {
        query = query.order('photographers(name)', { ascending: sortDirection === 'asc' });
      }
      
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      console.log(`Applying pagination: from ${from} to ${to} (page ${currentPage})`);
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }
      
      console.log("Assignments data fetched:", data?.length || 0, "records", "Total count:", count, "for page:", currentPage);
      
      if (onSearchComplete) {
        onSearchComplete();
      }
      
      return {
        assignments: data as (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> })[],
        totalCount: count || 0
      };
    },
    enabled: !isSearchActive || shouldSearch,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnMount: 'always',
  });

  const assignments = assignmentsData?.assignments || [];
  const totalCount = assignmentsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  console.log("Current assignments state:", { 
    assignmentsCount: assignments.length, 
    totalCount, 
    totalPages, 
    currentPage 
  });

  return {
    assignments,
    totalCount,
    totalPages,
    isLoading,
    refetch
  };
};
