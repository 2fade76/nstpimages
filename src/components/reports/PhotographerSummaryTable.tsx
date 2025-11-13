
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PhotographerSummaryTableProps {
  photographers: Array<{
    id: string;
    name: string;
    awards: string | null;
    assignmentCount: number;
    completedAssignments: number;
    openAssignments: number;
    cancelledAssignments: number;
    cameraSets: Array<{
      id: string;
      camera_body_model: string;
      status: string;
    }>;
  }>;
}

export function PhotographerSummaryTable({ photographers }: PhotographerSummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photographer Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Awards & Recognition</TableHead>
              <TableHead>Total Assignments</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Open</TableHead>
              <TableHead>Cancelled</TableHead>
              <TableHead>Camera Sets</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {photographers.map((photographer, index) => (
              <TableRow 
                key={photographer.id}
                className={`hover:bg-muted/50 transition-colors ${
                  index % 2 === 0 ? 'bg-muted/20' : ''
                }`}
              >
                <TableCell className="font-medium">{photographer.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {photographer.awards || 'N/A'}
                </TableCell>
                <TableCell>{photographer.assignmentCount}</TableCell>
                <TableCell>
                  <Badge className="bg-green-500 text-white">
                    {photographer.completedAssignments}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-blue-500 text-white">
                    {photographer.openAssignments}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-500 text-white">
                    {photographer.cancelledAssignments}
                  </Badge>
                </TableCell>
                <TableCell>{photographer.cameraSets.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
