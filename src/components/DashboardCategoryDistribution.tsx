import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const CATEGORIES = [
  { name: "News", color: "hsl(217 91% 60%)" },
  { name: "Sports", color: "hsl(142 71% 45%)" },
  { name: "Entertainment", color: "hsl(262 83% 65%)" },
] as const;

export const DashboardCategoryDistribution = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["category-distribution"],
    queryFn: async () => {
      const results = await Promise.all(
        CATEGORIES.map(async (c) => {
          const { count } = await supabase
            .from("assignments")
            .select("*", { count: "exact", head: true })
            .eq("category", c.name as any);
          return { name: c.name, value: count || 0, color: c.color };
        })
      );
      const total = results.reduce((s, r) => s + r.value, 0);
      return { items: results, total };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <Card className="rounded-2xl border-border/40 bg-card shadow-sm h-full">
      <CardHeader className="pb-2 px-5 pt-5">
        <CardTitle className="text-base font-semibold text-foreground">
          Category Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            <div className="h-40 sm:h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.items}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="95%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {data?.items.map((item, i) => (
                      <Cell key={i} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, n: string) => [v.toLocaleString(), n]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 space-y-2">
              {data?.items.map((item) => {
                const pct = data.total > 0 ? (item.value / data.total) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-foreground font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs tabular-nums shrink-0">
                      <span className="font-semibold text-foreground">{pct.toFixed(0)}%</span>
                      <span className="text-muted-foreground">({item.value.toLocaleString()})</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Assignments</span>
              <span className="text-base font-bold text-foreground tabular-nums">
                {data?.total.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};