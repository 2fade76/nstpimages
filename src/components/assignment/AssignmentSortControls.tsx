
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";

interface AssignmentSortControlsProps {
  sortField: 'date' | 'status' | 'photographer';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'date' | 'status' | 'photographer') => void;
}

export const AssignmentSortControls = ({
  sortField,
  sortDirection,
  onSort,
}: AssignmentSortControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSort('photographer')}
        className="flex items-center gap-1"
      >
        Photographer
        {sortField === 'photographer' && (
          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
        )}
        {sortField !== 'photographer' && <ArrowUpDown className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSort('status')}
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
        onClick={() => onSort('date')}
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
