
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { PhotographerSearch } from "./PhotographerSearch";

interface PhotographersHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onAddNew: () => void;
  searchResultsCount?: number;
}

export function PhotographersHeader({
  searchQuery,
  onSearch,
  onAddNew,
  searchResultsCount,
}: PhotographersHeaderProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Photographers</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full sm:w-auto">
          <PhotographerSearch 
            onSearch={onSearch} 
            searchQuery={searchQuery}
          />
          <Button onClick={onAddNew} size="sm" className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {searchQuery && (
        <div className="text-sm text-muted-foreground mb-4">
          {searchResultsCount || 0} photographer(s) found for "{searchQuery}"
        </div>
      )}
    </>
  );
}
