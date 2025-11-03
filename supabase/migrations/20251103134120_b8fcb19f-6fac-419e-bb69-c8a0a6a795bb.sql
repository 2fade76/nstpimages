-- Create optimized database function for dashboard trends
CREATE OR REPLACE FUNCTION public.get_dashboard_trends()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  today_date date;
  yesterday_date date;
BEGIN
  -- Get today's and yesterday's dates
  today_date := CURRENT_DATE;
  yesterday_date := today_date - INTERVAL '1 day';
  
  -- Build the result object
  SELECT jsonb_build_object(
    'current', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM assignments),
      'open', (SELECT COUNT(*) FROM assignments WHERE status = 'open'),
      'completed', (SELECT COUNT(*) FROM assignments WHERE status = 'complete'),
      'todayCompleted', (SELECT COUNT(*) FROM assignments WHERE status = 'complete' AND date = today_date)
    ),
    'yesterday', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM assignments WHERE created_at::date <= yesterday_date),
      'open', (SELECT COUNT(*) FROM assignments WHERE status = 'open' AND created_at::date <= yesterday_date),
      'completed', (SELECT COUNT(*) FROM assignments WHERE status = 'complete' AND created_at::date <= yesterday_date),
      'todayCompleted', (SELECT COUNT(*) FROM assignments WHERE status = 'complete' AND date = yesterday_date)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;