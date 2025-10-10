import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DashboardTrends {
  current: {
    total: number;
    open: number;
    completed: number;
    todayCompleted: number;
  };
  yesterday: {
    total: number;
    open: number;
    completed: number;
    todayCompleted: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    console.log('Fetching dashboard trends data...');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayISO = today.toISOString();
    const yesterdayISO = yesterday.toISOString();
    const tomorrowISO = new Date(today.getTime() + 86400000).toISOString();
    const dayAfterYesterdayISO = new Date(yesterday.getTime() + 86400000).toISOString();

    // Run all queries in parallel for maximum performance
    const [
      totalResult,
      openResult,
      completedResult,
      todayCompletedResult,
      yesterdayTotalResult,
      yesterdayOpenResult,
      yesterdayCompletedResult,
      yesterdayDailyCompletedResult,
    ] = await Promise.all([
      // Current totals
      supabase.from('assignments').select('*', { count: 'exact', head: true }),
      supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'complete'),
      supabase.from('assignments').select('*', { count: 'exact', head: true })
        .gte('date', todayISO)
        .lt('date', tomorrowISO)
        .eq('status', 'complete'),
      
      // Yesterday's totals (created before yesterday EOD)
      supabase.from('assignments').select('*', { count: 'exact', head: true })
        .lte('created_at', yesterdayISO),
      supabase.from('assignments').select('*', { count: 'exact', head: true })
        .eq('status', 'open')
        .lte('created_at', yesterdayISO),
      supabase.from('assignments').select('*', { count: 'exact', head: true })
        .eq('status', 'complete')
        .lte('created_at', yesterdayISO),
      supabase.from('assignments').select('*', { count: 'exact', head: true })
        .gte('date', yesterdayISO)
        .lt('date', dayAfterYesterdayISO)
        .eq('status', 'complete'),
    ]);

    const trends: DashboardTrends = {
      current: {
        total: totalResult.count || 0,
        open: openResult.count || 0,
        completed: completedResult.count || 0,
        todayCompleted: todayCompletedResult.count || 0,
      },
      yesterday: {
        total: yesterdayTotalResult.count || 0,
        open: yesterdayOpenResult.count || 0,
        completed: yesterdayCompletedResult.count || 0,
        todayCompleted: yesterdayDailyCompletedResult.count || 0,
      },
    };

    console.log('Dashboard trends fetched successfully:', trends);

    return new Response(JSON.stringify(trends), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching dashboard trends:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
