
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
  onViewCameraSets,
}: PhotographersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="bg-blue-800">Location</TableHead>
            <TableHead>Camera Body</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {photographers?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No photographers found matching your search." : "No photographers found."}
              </TableCell>
            </TableRow>
          ) : (
            photographers?.map(photographer => (
              <TableRow key={photographer.id}>
                <TableCell className="font-medium">{photographer.name}</TableCell>
                <TableCell className="bg-indigo-950">{photographer.Location || '-'}</TableCell>
                <TableCell>{photographer.camera_body || '-'}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(photographer.status)} className="bg-slate-500">
                    {getStatusDisplay(photographer.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => onViewCameraSets(photographer)}>
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
