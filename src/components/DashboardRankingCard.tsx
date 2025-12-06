import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTopPhotographers } from "@/hooks/useTopPhotographers";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1: return "bg-amber-400 text-amber-950";
    case 2: return "bg-slate-400 text-slate-950";
    case 3: return "bg-orange-400 text-orange-950";
    default: return "bg-muted text-muted-foreground";
  }
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const DashboardRankingCard = () => {
  const { data: topPhotographers, isLoading } = useTopPhotographers();

  const topThree = topPhotographers?.slice(0, 3) || [];
  const remaining = topPhotographers?.slice(3, 6) || [];

  return (
    <Card className="border-border/40 bg-card shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Photographer Ranking
          </CardTitle>
          <button className="p-1.5 hover:bg-muted rounded-md">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Top 3 with rank badges */}
            {topThree.map((photographer) => (
              <div 
                key={photographer.id} 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <span className={`absolute -top-1 -left-1 z-10 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${getRankBadgeColor(photographer.rank)}`}>
                    {photographer.rank}
                  </span>
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-medium">
                      {getInitials(photographer.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {photographer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {photographer.completedCount} assignments
                  </p>
                </div>
              </div>
            ))}

            {/* Remaining photographers in compact view */}
            {remaining.length > 0 && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                {remaining.map((photographer) => (
                  <div 
                    key={photographer.id} 
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-4">
                        {photographer.rank}
                      </span>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                          {getInitials(photographer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground truncate">
                        {photographer.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {photographer.completedCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
