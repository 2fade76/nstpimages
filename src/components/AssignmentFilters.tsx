
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Photographer } from "@/types/database";

type SortField = 'date' | 'status' | 'photographer';
type SortDirection = 'asc' | 'desc';

interface AssignmentFiltersProps {
  photographers?: Photographer[];
  selectedPhotographerFilter: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
  onPhotographerFilterChange: (photographerId: string | null) => void;
  onSort: (field: SortField) => void;
}

export const AssignmentFilters = ({
  photographers,
  selectedPhotographerFilter,
  sortField,
  sortDirection,
  onPhotographerFilterChange,
  onSort
}: AssignmentFiltersProps) => {
  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onSort(field)}
      className="flex items-center gap-1"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
      )}
      {sortField !== field && <ArrowUpDown className="h-4 w-4" />}
    </Button>
  );

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4 mr-1" />
            {selectedPhotographerFilter ? 
              photographers?.find(p => p.id === selectedPhotographerFilter)?.name :
              "Filter Photographer"
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {selectedPhotographerFilter && (
            <DropdownMenuItem onClick={() => onPhotographerFilterChange(null)}>
              Show All
            </DropdownMenuItem>
          )}
          {photographers?.map((photographer) => (
            <DropdownMenuItem
              key={photographer.id}
              onClick={() => onPhotographerFilterChange(photographer.id)}
            >
              {photographer.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <SortButton field="photographer">Photographer</SortButton>
      <SortButton field="status">Status</SortButton>
      <SortButton field="date">Date</SortButton>
    </div>
  );
};
