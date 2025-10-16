
import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

interface PhotographerSearchProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function PhotographerSearch({ onSearch, searchQuery }: PhotographerSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(localQuery, 300);

  // Trigger search when debounced value changes
  useEffect(() => {
    setIsSearching(true);
    onSearch(debouncedQuery);
    // Small delay to show loading state
    const timer = setTimeout(() => setIsSearching(false), 200);
    return () => clearTimeout(timer);
  }, [debouncedQuery, onSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleClear = () => {
    setLocalQuery("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center gap-2 w-full max-w-md">
      <div className="relative flex-1">
        {isSearching ? (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          type="text"
          placeholder="Search photographers..."
          value={localQuery}
          onChange={handleInputChange}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
