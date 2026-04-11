
CREATE OR REPLACE FUNCTION public.get_assignments_volume(
  start_date date,
  end_date date,
  group_by text DEFAULT 'daily'
)
RETURNS TABLE(period_date date, assignment_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN group_by = 'monthly' THEN date_trunc('month', d.date::date)::date
      ELSE d.date::date
    END AS period_date,
    COUNT(*)::bigint AS assignment_count
  FROM assignments d
  WHERE d.date::date >= start_date
    AND d.date::date <= end_date
  GROUP BY period_date
  ORDER BY period_date;
$$;
