import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CalendarDays, CalendarRange, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears, eachDayOfInterval, eachMonthOfInterval } from "date-fns";

type Period = "daily" | "weekly" | "monthly" | "ytd";

interface PeriodConfig {
  key: Period;
  label: string;
  compareLabel: string;
  icon: typeof Calendar;
  accent: string;
  iconBg: string;
  iconColor: string;
  stroke: string;
  fill: string;
}

const PERIODS: PeriodConfig[] = [
  {
    key: "daily",
    label: "Daily",
    compareLabel: "vs Yesterday",
    icon: Calendar,
    accent: "from-sky-500/15 to-sky-500/0",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-500",
    stroke: "hsl(199 89% 48%)",
    fill: "hsl(199 89% 48% / 0.18)",
  },
  {
    key: "weekly",
    label: "Weekly",
    compareLabel: "vs Last Week",
    icon: CalendarDays,
    accent: "from-emerald-500/15 to-emerald-500/0",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
    stroke: "hsl(142 71% 45%)",
    fill: "hsl(142 71% 45% / 0.18)",
  },
  {
    key: "monthly",
    label: "Monthly",
    compareLabel: "vs Last Month",
    icon: CalendarRange,
    accent: "from-amber-500/15 to-amber-500/0",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-500",
    stroke: "hsl(38 92% 50%)",
    fill: "hsl(38 92% 50% / 0.18)",
  },
  {
    key: "ytd",
    label: "Year to Date",
    compareLabel: "vs Last Year",
    icon: BarChart3,
    accent: "from-violet-500/15 to-violet-500/0",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-500",
    stroke: "hsl(262 83% 58%)",
    fill: "hsl(262 83% 58% / 0.18)",
  },
];

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface PeriodStats {
  current: number;
  previous: number;
  spark: { v: number }[];
}

const fetchPeriodStats = async (period: Period): Promise<PeriodStats> => {
  const today = new Date();

  const ranges = (() => {
    switch (period) {
      case "daily": {
        const cur = today;
        const prev = subDays(today, 1);
        return {
          curStart: cur, curEnd: cur,
          prevStart: prev, prevEnd: prev,
          sparkStart: subDays(today, 13), sparkEnd: today,
          group: "daily" as const,
        };
      }
      case "weekly": {
        const curStart = startOfWeek(today, { weekStartsOn: 1 });
        const curEnd = endOfWeek(today, { weekStartsOn: 1 });
        const prevStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        const prevEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
        return {
          curStart, curEnd, prevStart, prevEnd,
          sparkStart: subDays(today, 13), sparkEnd: today,
          group: "daily" as const,
        };
      }
      case "monthly": {
        const curStart = startOfMonth(today);
        const curEnd = endOfMonth(today);
        const prevStart = startOfMonth(subMonths(today, 1));
        const prevEnd = endOfMonth(subMonths(today, 1));
        return {
          curStart, curEnd, prevStart, prevEnd,
          sparkStart: subDays(today, 29), sparkEnd: today,
          group: "daily" as const,
        };
      }
      case "ytd": {
        const curStart = startOfYear(today);
        const curEnd = today;
        const prevStart = startOfYear(subYears(today, 1));
        const prevEnd = endOfYear(subYears(today, 1));
        return {
          curStart, curEnd, prevStart, prevEnd,
          sparkStart: startOfYear(today), sparkEnd: today,
          group: "monthly" as const,
        };
      }
    }
  })();

  const countCompleted = async (start: Date, end: Date) => {
    const { count } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("status", "complete")
      .gte("date", fmtDate(start))
      .lte("date", fmtDate(end));
    return count || 0;
  };

  const [current, previous, sparkRes] = await Promise.all([
    countCompleted(ranges.curStart, ranges.curEnd),
    countCompleted(ranges.prevStart, ranges.prevEnd),
    supabase.rpc("get_assignments_volume", {
      start_date: fmtDate(ranges.sparkStart),
      end_date: fmtDate(ranges.sparkEnd),
      group_by: ranges.group,
    }),
  ]);

  const map = new Map(
    (sparkRes.data || []).map((r: any) => [r.period_date, Number(r.assignment_count)])
  );

  let spark: { v: number }[];
  if (ranges.group === "monthly") {
    spark = eachMonthOfInterval({ start: ranges.sparkStart, end: ranges.sparkEnd }).map((d) => ({
      v: map.get(fmtDate(d)) || 0,
    }));
  } else {
    spark = eachDayOfInterval({ start: ranges.sparkStart, end: ranges.sparkEnd }).map((d) => ({
      v: map.get(fmtDate(d)) || 0,
    }));
  }

  return { current, previous, spark };
};

const CompletionCard = ({ cfg }: { cfg: PeriodConfig }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["completion-stats", cfg.key],
    queryFn: () => fetchPeriodStats(cfg.key),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const Icon = cfg.icon;
  const change = (data?.current || 0) - (data?.previous || 0);
  const pct = data?.previous ? Math.abs((change / data.previous) * 100) : 0;
  const isUp = change >= 0;

  return (
    <Card className="rounded-2xl border-border/40 bg-card overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.accent} pointer-events-none`} />
      <CardContent className="p-4 sm:p-5 relative">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Complete Assignments
            </p>
            <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
          </div>
        </div>

        <div className="mt-3">
          {isLoading ? (
            <Skeleton className="h-9 w-24" />
          ) : (
            <span className="text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
              {(data?.current || 0).toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">{cfg.compareLabel}</span>
          {!isLoading && data && data.previous > 0 && (
            <span className={`flex items-center gap-0.5 font-semibold ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
              {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {pct.toFixed(1)}%
            </span>
          )}
        </div>

        <div className="mt-2 h-10 -mx-1">
          {!isLoading && data && data.spark.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`spark-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.stroke} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={cfg.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={cfg.stroke}
                  strokeWidth={1.75}
                  fill={`url(#spark-${cfg.key})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardCompletionStats = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {PERIODS.map((cfg) => (
        <CompletionCard key={cfg.key} cfg={cfg} />
      ))}
    </div>
  );
};