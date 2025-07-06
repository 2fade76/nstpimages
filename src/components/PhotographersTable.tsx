import { Photographer } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Edit, Trash2 } from "lucide-react";
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'staff':
      return 'Staff Photographer';
    case 'stringers':
      return 'Stringer Photographer';
    case 'staff_oc':
      return 'Staff OC';
    default:
      return status;
  }
};
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'staff':
    case 'staff_oc':
      return 'default' as const;
    case 'stringers':
      return 'secondary' as const;
    default:
      return 'secondary' as const;
  }
};
interface PhotographersTableProps {
  photographers: Photographer[];
  searchQuery: string;
  onEdit: (photographer: Photographer) => void;
  onDelete: (id: string) => void;
  onViewCameraSets: (photographer: Photographer) => void;
}
export function PhotographersTable({
  photographers,
  searchQuery,
  onEdit,
  onDelete,
  onViewCameraSets
}: PhotographersTableProps) {
  return <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {photographers?.length === 0 ? <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No photographers found matching your search." : "No photographers found."}
              </TableCell>
            </TableRow> : photographers?.map(photographer => <TableRow key={photographer.id}>
                <TableCell className="font-medium">{photographer.name}</TableCell>
                <TableCell>{photographer.Location || '-'}</TableCell>
                <TableCell>{photographer.email || '-'}</TableCell>
                <TableCell>{photographer.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(photographer.status)}>
                    {getStatusDisplay(photographer.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => onViewCameraSets(photographer)} className="text-amber-50 bg-green-950 hover:bg-green-800">
                      <Camera className="h-4 w-4 mr-1" />
                      Camera Sets
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(photographer)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(photographer.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>)}
        </TableBody>
      </Table>
    </div>;
}