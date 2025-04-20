
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { SortDirection, SortField } from "@/types/assignments";
import { Photographer } from "@/types/database";

interface AssignmentFiltersProps {
  selectedPhotographerId: string | null;
  photographers?: Photographer[];
  sortField: SortField;
  sortDirection: SortDirection;
  onPhotographerChange: (value: string | null) => void;
  onSortChange: (field: SortField) => void;
}

export const AssignmentFilters = ({
  selectedPhotographerId,
  photographers,
  sortField,
  sortDirection,
  onPhotographerChange,
  onSortChange,
}: AssignmentFiltersProps) => {
  return (
    <div className="flex gap-2">
      <Select
        value={selectedPhotographerId || "all"}
        onValueChange={(value) => onPhotographerChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by photographer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All photographers</SelectItem>
          {photographers?.map((photographer) => (
            <SelectItem key={photographer.id} value={photographer.id}>
              {photographer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortChange('status')}
        className="flex items-center gap-1"
      >
        Status
        {sortField === 'status' && (
          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
        )}
        {sortField !== 'status' && <ArrowUpDown className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortChange('date')}
        className="flex items-center gap-1"
      >
        Date
        {sortField === 'date' && (
          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
        )}
        {sortField !== 'date' && <ArrowUpDown className="h-4 w-4" />}
      </Button>
    </div>
  );
};
