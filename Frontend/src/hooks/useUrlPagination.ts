import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePagination } from './usePagination';

interface UseUrlPaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
}

export const useUrlPagination = <T>(
  data: T[],
  options: UseUrlPaginationOptions = {}
) => {
  const { defaultPage = 1, defaultLimit = 10 } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  
  const initialPage = pageParam ? parseInt(pageParam, 10) : defaultPage;
  const initialLimit = limitParam ? parseInt(limitParam, 10) : defaultLimit;
  
  const {
    data: paginatedData,
    pagination,
    goToPage: originalGoToPage,
    goToNextPage: originalGoToNextPage,
    goToPreviousPage: originalGoToPreviousPage,
    goToFirstPage: originalGoToFirstPage,
    goToLastPage: originalGoToLastPage,
    changeItemsPerPage: originalChangeItemsPerPage,
  } = usePagination(data, initialPage, initialLimit);

  const updateUrl = (page: number, limit: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    newParams.set('limit', limit.toString());
    setSearchParams(newParams);
  };

  const goToPage = (page: number) => {
    originalGoToPage(page);
    updateUrl(page, pagination.itemsPerPage);
  };

  const goToNextPage = () => {
    const nextPage = pagination.currentPage + 1;
    if (nextPage <= pagination.totalPages) {
      originalGoToNextPage();
      updateUrl(nextPage, pagination.itemsPerPage);
    }
  };

  const goToPreviousPage = () => {
    const prevPage = pagination.currentPage - 1;
    if (prevPage >= 1) {
      originalGoToPreviousPage();
      updateUrl(prevPage, pagination.itemsPerPage);
    }
  };

  const goToFirstPage = () => {
    originalGoToFirstPage();
    updateUrl(1, pagination.itemsPerPage);
  };

  const goToLastPage = () => {
    originalGoToLastPage();
    updateUrl(pagination.totalPages, pagination.itemsPerPage);
  };

  const changeItemsPerPage = (newItemsPerPage: number) => {
    originalChangeItemsPerPage(newItemsPerPage);
    updateUrl(1, newItemsPerPage);
  };

  return {
    data: paginatedData,
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changeItemsPerPage,
  };
};
