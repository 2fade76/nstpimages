-- Create a function to efficiently get top photographers
CREATE OR REPLACE FUNCTION public.get_top_photographers(limit_count integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  name text,
  completed_count bigint,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH photographer_counts AS (
    SELECT 
      p.id,
      p.name,
      COUNT(a.id) as completed_count
    FROM photographers p
    LEFT JOIN assignments a ON a.photographer_id = p.id AND a.status = 'complete'
    GROUP BY p.id, p.name
    HAVING COUNT(a.id) > 0
    ORDER BY COUNT(a.id) DESC
    LIMIT limit_count
  )
  SELECT 
    id,
    name,
    completed_count,
    ROW_NUMBER() OVER (ORDER BY completed_count DESC) as rank
  FROM photographer_counts;
$$;

-- Create an index to speed up the query
CREATE INDEX IF NOT EXISTS idx_assignments_photographer_status 
ON assignments(photographer_id, status) 
WHERE status = 'complete';