import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UrlPaginationConfig {
  pageParam?: string;
  limitParam?: string;
  defaultPage?: number;
  defaultLimit?: number;
}

export interface UrlPaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  changeItemsPerPage: (limit: number) => void;
}

/**
 * Enhanced pagination hook that synchronizes with URL parameters
 * This allows users to bookmark pages and share URLs with specific pagination states
 */
export function useUrlPagination<T>(
  items: T[],
  config: UrlPaginationConfig = {}
): UrlPaginationResult<T> {
  const {
    pageParam = 'page',
    limitParam = 'limit',
    defaultPage = 1,
    defaultLimit = 10
  } = config;

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values from URL or use defaults
  const currentPage = parseInt(searchParams.get(pageParam) || defaultPage.toString());
  const itemsPerPage = parseInt(searchParams.get(limitParam) || defaultLimit.toString());

  const paginatedData = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const data = items.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        currentPage: validCurrentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNextPage: validCurrentPage < totalPages,
        hasPreviousPage: validCurrentPage > 1,
        startIndex: startIndex + 1,
        endIndex,
      },
    };
  }, [items, currentPage, itemsPerPage]);

  const updateUrlParams = (newPage: number, newLimit?: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(pageParam, newPage.toString());
    if (newLimit !== undefined) {
      params.set(limitParam, newLimit.toString());
    }
    setSearchParams(params);
  };

  const goToPage = (page: number) => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      updateUrlParams(page);
    }
  };

  const goToNextPage = () => {
    if (paginatedData.pagination.hasNextPage) {
      updateUrlParams(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (paginatedData.pagination.hasPreviousPage) {
      updateUrlParams(currentPage - 1);
    }
  };

  const changeItemsPerPage = (limit: number) => {
    updateUrlParams(1, limit); // Reset to first page when changing items per page
  };

  return {
    ...paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeItemsPerPage,
  };
}
