"use client"

import { useState, useCallback } from "react"
import type { PaginationState } from "@tanstack/react-table"
import { useSearchParams } from "./use-search-params"

export interface FilterConfig {
  key: string
  label: string
  options: { value: string; label: string }[]
}

export interface UseDataTableFiltersProps<TData> {
  initialData: TData[]
  initialPagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  fetchData: (params: {
    page: number
    pageSize: number
    search?: string
    filters: Record<string, string>
  }) => Promise<{
    data: TData[]
    pagination: {
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
    }
  }>
  filterConfigs: FilterConfig[]
  urlParamMapping?: {
    search?: string
    page?: string
    pageSize?: string
    [key: string]: string | undefined
  }
}

export function useDataTableFilters<TData>({
  initialData,
  initialPagination,
  fetchData,
  filterConfigs,
  urlParamMapping = {
    search: "Search_Term",
    page: "page",
    pageSize: "per_page",
  },
}: UseDataTableFiltersProps<TData>) {
  const { getParam, setParams } = useSearchParams()

  const [data, setData] = useState<TData[]>(initialData)
  const [searchQuery, setSearchQuery] = useState(getParam(urlParamMapping.search || "Search_Term") || "")
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const initialFilters = filterConfigs.reduce((acc, config) => {
      const paramKey = urlParamMapping[config.key] || config.key
      const urlValue = getParam(paramKey)
      return { ...acc, [config.key]: urlValue || "all" }
    }, {})
    return initialFilters
  })
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialPagination.page - 1,
    pageSize: initialPagination.pageSize,
  })
  const [totalCount, setTotalCount] = useState(initialPagination.totalCount)

  const syncUrlParams = useCallback(
    (currentPagination: PaginationState, currentSearch: string, currentFilters: Record<string, string>) => {
      const params: Record<string, string | number | null> = {
        [urlParamMapping.page || "page"]: currentPagination.pageIndex + 1,
        [urlParamMapping.pageSize || "per_page"]: currentPagination.pageSize,
        [urlParamMapping.search || "Search_Term"]: currentSearch || null,
      }

      // Add filter params
      Object.entries(currentFilters).forEach(([key, value]) => {
        const paramKey = urlParamMapping[key] || key
        params[paramKey] = value !== "all" ? value : null
      })

      setParams(params, true)
    },
    [setParams, urlParamMapping],
  )

  const fetch = useCallback(
    async (newPagination?: PaginationState, newSearch?: string, newFilters?: Record<string, string>) => {
      setIsLoading(true)
      try {
        const paginationToUse = newPagination || pagination
        const searchToUse = newSearch !== undefined ? newSearch : searchQuery
        const filtersToUse = newFilters || filters

        syncUrlParams(paginationToUse, searchToUse, filtersToUse)

        const result = await fetchData({
          page: paginationToUse.pageIndex + 1,
          pageSize: paginationToUse.pageSize,
          search: searchToUse || undefined,
          filters: Object.fromEntries(Object.entries(filtersToUse).filter(([_, value]) => value !== "all")),
        })

        setData(result.data)
        setTotalCount(result.pagination.totalCount)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    },
    [pagination, searchQuery, filters, fetchData, syncUrlParams],
  )

  const handleSearch = useCallback(() => {
    const newPagination = { ...pagination, pageIndex: 0 }
    setPagination(newPagination)
    fetch(newPagination, searchQuery, filters)
  }, [pagination, searchQuery, filters, fetch])

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value }
      const newPagination = { ...pagination, pageIndex: 0 }
      setFilters(newFilters)
      setPagination(newPagination)
      setTimeout(() => fetch(newPagination, searchQuery, newFilters), 0)
    },
    [filters, pagination, searchQuery, fetch],
  )

  const handlePaginationChange = useCallback(
    (newPageIndex: number) => {
      const newPagination = { ...pagination, pageIndex: newPageIndex }
      setPagination(newPagination)
      setTimeout(() => fetch(newPagination, searchQuery, filters), 0)
    },
    [pagination, searchQuery, filters, fetch],
  )

  const clearAllFilters = useCallback(() => {
    const clearedFilters = filterConfigs.reduce((acc, config) => ({ ...acc, [config.key]: "all" }), {})
    const newPagination = { ...pagination, pageIndex: 0 }
    setFilters(clearedFilters)
    setPagination(newPagination)
    setTimeout(() => fetch(newPagination, searchQuery, clearedFilters), 0)
  }, [filterConfigs, pagination, searchQuery, fetch])

  const clearSearch = useCallback(() => {
    const newPagination = { ...pagination, pageIndex: 0 }
    setSearchQuery("")
    setPagination(newPagination)
    setTimeout(() => fetch(newPagination, "", filters), 0)
  }, [pagination, filters, fetch])

  const removeFilter = useCallback(
    (key: string) => {
      const newFilters = { ...filters, [key]: "all" }
      const newPagination = { ...pagination, pageIndex: 0 }
      setFilters(newFilters)
      setPagination(newPagination)
      setTimeout(() => fetch(newPagination, searchQuery, newFilters), 0)
    },
    [filters, pagination, searchQuery, fetch],
  )

  const hasActiveSearch = searchQuery !== ""
  const hasActiveFilters = Object.values(filters).some((value) => value !== "all")
  const activeFilterCount = Object.values(filters).filter((value) => value !== "all").length

  return {
    data,
    searchQuery,
    setSearchQuery,
    filters,
    isLoading,
    pagination,
    setPagination,
    totalCount,
    handleSearch,
    handleFilterChange,
    handlePaginationChange,
    clearAllFilters,
    clearSearch,
    removeFilter,
    hasActiveSearch,
    hasActiveFilters,
    activeFilterCount,
  }
}