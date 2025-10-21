import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter } from "lucide-react";
import { ReportFilters } from "@/pages/Reports";
import { format } from "date-fns";

interface ActiveFiltersProps {
  filters: ReportFilters;
  onClearFilters: () => void;
}

export function ActiveFilters({ filters, onClearFilters }: ActiveFiltersProps) {
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.photographerId) count++;
    if (filters.assignmentStatuses.length > 0) count++;
    if (filters.cameraModels.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  if (activeCount === 0) {
    return null;
  }

  const scopeMap = {
    'both': 'Both Assignments & Cameras',
    'assignments': 'Assignments Only',
    'cameras': 'Cameras Only'
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Active Filters</span>
          <Badge variant="secondary">{activeCount}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="mr-1 h-3 w-3" />
          Clear All
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="font-normal">
          {scopeMap[filters.reportScope]}
        </Badge>

        {filters.photographerId && (
          <Badge variant="outline" className="font-normal">
            Photographer: {filters.photographerId}
          </Badge>
        )}

        {filters.assignmentStatuses.length > 0 && (
          <Badge variant="outline" className="font-normal">
            Status: {filters.assignmentStatuses.join(', ')}
          </Badge>
        )}

        {filters.cameraModels.length > 0 && (
          <Badge variant="outline" className="font-normal">
            Models: {filters.cameraModels.length} selected
          </Badge>
        )}

        {filters.dateRange.from && (
          <Badge variant="outline" className="font-normal">
            From: {format(filters.dateRange.from, 'MMM d, yyyy')}
          </Badge>
        )}

        {filters.dateRange.to && (
          <Badge variant="outline" className="font-normal">
            To: {format(filters.dateRange.to, 'MMM d, yyyy')}
          </Badge>
        )}

        {filters.includeAssignmentDetails && (
          <Badge variant="outline" className="font-normal">
            Include Assignment Details
          </Badge>
        )}
      </div>
    </div>
  );
}
