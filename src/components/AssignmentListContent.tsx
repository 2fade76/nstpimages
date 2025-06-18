
import { Assignment, Photographer } from "@/types/database";
import { AssignmentCard } from "./AssignmentCard";
import { AssignmentPagination } from "./AssignmentPagination";

interface AssignmentListContentProps {
  assignments: (Assignment & { photographers: Pick<Photographer, 'id' | 'name'> })[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  statusFilter: 'all' | 'open' | 'complete' | 'today-complete';
  searchQuery: string;
  shouldSearch: boolean;
  onEdit: (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => void;
  onDelete: (assignment: Assignment & { photographers: Pick<Photographer, 'id' | 'name'> }) => void;
  onPhotographerClick: (photographerId: string) => void;
  onPageChange: (page: number) => void;
}

export const AssignmentListContent = ({
  assignments,
  totalCount,
  currentPage,
  totalPages,
  statusFilter,
  searchQuery,
  shouldSearch,
  onEdit,
  onDelete,
  onPhotographerClick,
  onPageChange
}: AssignmentListContentProps) => {
  const getFilterDescription = () => {
    switch (statusFilter) {
      case 'open':
        return 'Open assignments';
      case 'complete':
        return 'Completed assignments';
      case 'today-complete':
        return "Today's completed assignments";
      default:
        return 'All assignments';
    }
  };

  if (assignments.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/10">
        {shouldSearch 
          ? `No assignments found matching "${searchQuery}". Try a different search term.` 
          : `No ${getFilterDescription().toLowerCase()} found.`}
      </div>
    );
  }

  return (
    <>
      <div className="text-sm text-muted-foreground mb-4">
        Showing {assignments.length} of {totalCount} {getFilterDescription().toLowerCase()} 
        {shouldSearch && <span className="ml-2 font-medium">Search: "{searchQuery}"</span>}
        {totalPages > 1 && (
          <span className="ml-2">
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>

      <div className="space-y-2">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            assignment={assignment}
            onEdit={onEdit}
            onDelete={onDelete}
            onPhotographerClick={onPhotographerClick}
          />
        ))}
      </div>

      <AssignmentPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};
