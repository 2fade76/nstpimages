import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CameraModelStatsProps {
  cameraSets: Array<{
    camera_body_model: string;
    status: string;
  }>;
}

export function CameraModelStats({ cameraSets }: CameraModelStatsProps) {
  // Calculate stats by camera model
  const modelStats = cameraSets.reduce((acc, cameraSet) => {
    const model = cameraSet.camera_body_model || 'Unknown';
    if (!acc[model]) {
      acc[model] = {
        total: 0,
        active: 0,
        inactive: 0,
      };
    }
    acc[model].total++;
    if (cameraSet.status === 'active') {
      acc[model].active++;
    } else {
      acc[model].inactive++;
    }
    return acc;
  }, {} as Record<string, { total: number; active: number; inactive: number }>);

  const sortedModels = Object.entries(modelStats).sort(([, a], [, b]) => b.total - a.total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Camera Model Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedModels.map(([model, stats]) => (
              <div key={model} className="border rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">{model}</h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total:</span>
                    <Badge variant="outline">{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Active:</span>
                    <Badge className="bg-green-500 text-white">{stats.active}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Inactive:</span>
                    <Badge variant="secondary">{stats.inactive}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{cameraSets.length}</div>
                <div className="text-xs text-muted-foreground">Total Camera Sets</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Object.keys(modelStats).length}</div>
                <div className="text-xs text-muted-foreground">Unique Models</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {cameraSets.filter(cs => cs.status === 'active').length}
                </div>
                <div className="text-xs text-muted-foreground">Active Sets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {cameraSets.filter(cs => cs.status !== 'active').length}
                </div>
                <div className="text-xs text-muted-foreground">Inactive Sets</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}