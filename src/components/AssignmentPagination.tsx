
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AssignmentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AssignmentPagination = ({ currentPage, totalPages, onPageChange }: AssignmentPaginationProps) => {
  console.log("AssignmentPagination rendered with:", { currentPage, totalPages });
  
  if (totalPages <= 1) {
    console.log("Not showing pagination - totalPages:", totalPages);
    return null;
  }

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      console.log("Previous clicked - going to page:", currentPage - 1);
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      console.log("Next clicked - going to page:", currentPage + 1);
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    console.log("Page clicked:", pageNumber);
    onPageChange(pageNumber);
  };

  return (
    <div className="flex justify-center mt-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={handlePreviousClick}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {/* Show first page */}
          {currentPage > 3 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageClick(1)} className="cursor-pointer">
                  1
                </PaginationLink>
              </PaginationItem>
              {currentPage > 4 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}
          
          {/* Show pages around current page */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNumber = Math.max(1, currentPage - 2) + i;
            if (pageNumber > totalPages) return null;
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink 
                  onClick={() => handlePageClick(pageNumber)}
                  isActive={currentPage === pageNumber}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {/* Show last page */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageClick(totalPages)} className="cursor-pointer">
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={handleNextClick}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
