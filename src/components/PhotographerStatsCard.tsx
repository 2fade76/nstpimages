
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Camera, UserCheck } from "lucide-react";
import { Photographer } from "@/types/database";

interface PhotographerStatsCardProps {
  photographers: Photographer[];
}

export function PhotographerStatsCard({ photographers }: PhotographerStatsCardProps) {
  const staffCount = photographers?.filter(p => p.status === 'staff').length || 0;
  const staffOcCount = photographers?.filter(p => p.status === 'staff_oc').length || 0;
  const stringersCount = photographers?.filter(p => p.status === 'stringers').length || 0;

  const stats = [
    {
      title: "Staff Photographers",
      count: staffCount,
      icon: Users,
      description: "Active staff photographers"
    },
    {
      title: "Photo OCs", 
      count: staffOcCount,
      icon: UserCheck,
      description: "Staff photo coordinators"
    },
    {
      title: "Stringer Photographers",
      count: stringersCount,
      icon: Camera,
      description: "Freelance photographers"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
