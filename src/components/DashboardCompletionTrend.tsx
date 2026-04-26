import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, AreaChart, Area } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval, startOfWeek, eachWeekOfInterval, startOfMonth, eachMonthOfInterval, endOfMonth } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Activity, ArrowUp, ArrowDown, Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type View = "daily" | "weekly" | "monthly";

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const DashboardCompletionTrend = () => {
  const [view, setView] = useState<View>("daily");
  const today = new Date();

  const range = useMemo(() => {
    if (view === "daily") return { start: subDays(today, 6), end: today };
    if (view === "weekly") return { start: subDays(today, 7 * 8 - 1), end: today };
    return { start: subDays(today, 365), end: today };
  }, [view]);

  const { data, isLoading } = useQuery({
    queryKey: ["completion-trend", view],
    queryFn: async () => {
      const groupBy = view === "monthly" ? "monthly" : "daily";
      const { data: raw } = await supabase.rpc("get_assignments_volume", {
        start_date: fmt(range.start),
        end_date: fmt(range.end),
        group_by: groupBy,
      });
      const map = new Map((raw || []).map((r: any) => [r.period_date, Number(r.assignment_count)]));

      if (view === "daily") {
        return eachDayOfInterval({ start: range.start, end: range.end }).map((d) => ({
          label: format(d, "MMM d"),
          value: map.get(fmt(d)) || 0,
          date: d,
        }));
      }
      if (view === "weekly") {
        const weeks = eachWeekOfInterval({ start: range.start, end: range.end }, { weekStartsOn: 1 });
        return weeks.map((wkStart) => {
          const wkEnd = subDays(eachDayOfInterval({ start: wkStart, end: subDays(wkStart, -6) })[6], 0);
          let total = 0;
          eachDayOfInterval({ start: wkStart, end: wkEnd }).forEach((d) => {
            total += (map.get(fmt(d)) as number) || 0;
          });
          return { label: format(wkStart, "MMM d"), value: total, date: wkStart };
        });
      }
      return eachMonthOfInterval({ start: range.start, end: range.end }).map((m) => ({
        label: format(m, "MMM"),
        value: (map.get(fmt(startOfMonth(m))) as number) || 0,
        date: m,
      }));
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const values = data.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const maxIdx = values.indexOf(Math.max(...values));
    const minIdx = values.indexOf(Math.min(...values));
    return {
      avg: avg.toFixed(1),
      max: { value: data[maxIdx].value, label: data[maxIdx].label },
      min: { value: data[minIdx].value, label: data[minIdx].label },
    };
  }, [data]);

  const periodLabel = view === "daily" ? "7-Day" : view === "weekly" ? "8-Week" : "12-Month";

  return (
    <Card className="rounded-2xl border-border/40 bg-card shadow-sm h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              Assignment Completion Trend
            </CardTitle>
          </div>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as View)}
            className="bg-muted/60 rounded-xl p-0.5"
          >
            <ToggleGroupItem value="daily" className="text-xs px-3 h-7 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">
              Daily
            </ToggleGroupItem>
            <ToggleGroupItem value="weekly" className="text-xs px-3 h-7 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">
              Weekly
            </ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="text-xs px-3 h-7 rounded-lg data-[state=on]:bg-background data-[state=on]:shadow-sm">
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-5 pb-5 pt-2">
        <div className="h-[220px] sm:h-[260px]">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={32}
                />
                <Tooltip
                  formatter={(v: number) => [v, "Completed"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    padding: "8px 12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                  dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {stats && (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/40 rounded-xl">
            <div className="flex items-start gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Gauge className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{periodLabel} Avg</p>
                <p className="text-sm font-bold text-foreground tabular-nums">{stats.avg}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <ArrowUp className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Highest</p>
                <p className="text-sm font-bold text-foreground tabular-nums truncate">
                  {stats.max.value} <span className="text-xs font-normal text-muted-foreground">({stats.max.label})</span>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <ArrowDown className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Lowest</p>
                <p className="text-sm font-bold text-foreground tabular-nums truncate">
                  {stats.min.value} <span className="text-xs font-normal text-muted-foreground">({stats.min.label})</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};