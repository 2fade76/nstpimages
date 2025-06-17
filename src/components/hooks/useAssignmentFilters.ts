
import { useState } from "react";

type SortField = 'date' | 'status' | 'photographer';
type SortDirection = 'asc' | 'desc';

export const useAssignmentFilters = () => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhotographerFilter, setSelectedPhotographerFilter] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
    
    console.log(`Sorting changed to ${field} in ${sortDirection === 'asc' ? 'desc' : 'asc'} order`);
  };

  const handlePageChange = (page: number) => {
    console.log(`Page change requested: ${currentPage} -> ${page}`);
    setCurrentPage(page);
  };

  const handlePhotographerFilterChange = (photographerId: string | null) => {
    console.log(`Photographer filter changing from: ${selectedPhotographerFilter} to: ${photographerId}`);
    setSelectedPhotographerFilter(photographerId);
    setCurrentPage(1);
    console.log(`Photographer filter state updated to: ${photographerId}`);
  };

  return {
    sortField,
    sortDirection,
    currentPage,
    selectedPhotographerFilter,
    handleSort,
    handlePageChange,
    handlePhotographerFilterChange,
    setCurrentPage
  };
};
