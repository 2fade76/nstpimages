import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhotographerRanking } from "@/hooks/usePhotographerRanking";
import { Trophy, Medal, Award } from "lucide-react";

export const PhotographerRanking = () => {
  const { data: rankings, isLoading, error } = usePhotographerRanking();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"; // Gold
      case 2:
        return "secondary"; // Silver
      case 3:
        return "outline"; // Bronze
      default:
        return "outline";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Photographers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Error loading photographer rankings
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Photographers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-8" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : rankings && rankings.length > 0 ? (
          <div className="space-y-3">
            {rankings.slice(0, 10).map((photographer, index) => {
              const rank = index + 1;
              return (
                <div
                  key={photographer.name}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-8">
                      {getRankIcon(rank)}
                      <span className="text-sm font-medium text-muted-foreground">
                        {rank}
                      </span>
                    </div>
                    <span className="font-medium">{photographer.name}</span>
                  </div>
                  <Badge variant={getRankBadgeVariant(rank)} className="text-sm">
                    {photographer.total} completed
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No completed assignments found
          </div>
        )}
      </CardContent>
    </Card>
  );
};