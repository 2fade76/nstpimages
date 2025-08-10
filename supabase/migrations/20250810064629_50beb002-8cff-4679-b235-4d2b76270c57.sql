-- Function to get monthly completed assignments from Jan 2025 to current month, including months with zero
CREATE OR REPLACE FUNCTION public.get_monthly_completed_assignments(
  start_date date DEFAULT DATE '2025-01-01',
  end_date date DEFAULT now()::date
)
RETURNS TABLE (
  month_key text,   -- format: 'YYYY-MM'
  total integer
)
LANGUAGE sql
STABLE
AS $$
WITH months AS (
  SELECT date_trunc('month', gs)::date AS month_start
  FROM generate_series(
    date_trunc('month', start_date)::date,
    date_trunc('month', end_date)::date,
    interval '1 month'
  ) AS gs
),
counts AS (
  SELECT date_trunc('month', a.date)::date AS month_start,
         count(*)::int AS total
  FROM public.assignments a
  WHERE a.status = 'complete'
    AND a.date >= date_trunc('month', start_date)::date
    AND a.date <  (date_trunc('month', end_date)::date + interval '1 month')
  GROUP BY 1
)
SELECT to_char(m.month_start, 'YYYY-MM') AS month_key,
       COALESCE(c.total, 0)              AS total
FROM months m
LEFT JOIN counts c ON c.month_start = m.month_start
ORDER BY m.month_start;
$$;