
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface AssignmentDetailsTableProps {
  assignments: Array<{
    id: string;
    title: string;
    location: string;
    date: string;
    status: string;
    photographer_name: string;
  }>;
}

export function AssignmentDetailsTable({ assignments }: AssignmentDetailsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'open':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'active':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Photographer</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.title}</TableCell>
                <TableCell>{assignment.location}</TableCell>
                <TableCell>{format(new Date(assignment.date), 'PPP')}</TableCell>
                <TableCell>{assignment.photographer_name}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                    {assignment.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
