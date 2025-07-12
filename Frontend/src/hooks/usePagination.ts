import { useState, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  changeItemsPerPage: (newItemsPerPage: number) => void;
}

export function usePagination<T>(
  data: T[],
  initialPage: number = 1,
  initialItemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const pagination: PaginationState = {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
  };

  const actions: PaginationActions = {
    goToPage: (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    goToNextPage: () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    },
    goToPreviousPage: () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    goToFirstPage: () => setCurrentPage(1),
    goToLastPage: () => setCurrentPage(totalPages),
    changeItemsPerPage: (newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    },
  };

  return {
    data: paginatedData,
    pagination,
    ...actions,
  };
}
