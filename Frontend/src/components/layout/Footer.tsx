import React from 'react';
import { PaginationControls } from '@/components/ui/pagination-controls';

interface FooterProps {
  showPagination?: boolean;
  paginationProps?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
    onNextPage: () => void;
    onPreviousPage: () => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    itemsPerPageOptions?: number[];
  };
}

export const Footer: React.FC<FooterProps> = ({ showPagination = false, paginationProps }) => {
  return (
    <footer className="border-t bg-background mt-auto">
      {showPagination && paginationProps && (
        <div className="container py-6">
          <PaginationControls
            currentPage={paginationProps.currentPage}
            totalPages={paginationProps.totalPages}
            totalItems={paginationProps.totalItems}
            itemsPerPage={paginationProps.itemsPerPage}
            startIndex={paginationProps.startIndex}
            endIndex={paginationProps.endIndex}
            hasNextPage={paginationProps.hasNextPage}
            hasPreviousPage={paginationProps.hasPreviousPage}
            onPageChange={paginationProps.onPageChange}
            onNextPage={paginationProps.onNextPage}
            onPreviousPage={paginationProps.onPreviousPage}
            onItemsPerPageChange={paginationProps.onItemsPerPageChange}
            itemsPerPageOptions={paginationProps.itemsPerPageOptions}
            showSummary={true}
          />
        </div>
      )}
      
      <div className="border-t">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© 2024 StackIt</span>
              <span>•</span>
              <span>Community Q&A Platform</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};