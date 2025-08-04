
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
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
      <Combobox
        options={photographers?.map(p => ({ value: p.id, label: p.name })) || []}
        value={selectedPhotographerFilter || undefined}
        onSelect={(value) => onPhotographerFilterChange(value || null)}
        placeholder="Filter photographer..."
        searchPlaceholder="Search photographers..."
        emptyText="No photographers found."
        className="w-[200px]"
      />
      
      <SortButton field="photographer">Photographer</SortButton>
      <SortButton field="status">Status</SortButton>
      <SortButton field="date">Date</SortButton>
    </div>
  );
};
