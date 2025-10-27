"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { FilterOption } from "@/types";

type TableFilterValues = {
  categories?: FilterOption[];
  conditions?: FilterOption[];
  locations?: FilterOption[];
  statuses?: FilterOption[];
  suppliers?: FilterOption[];
  priorities?: FilterOption[];
};

type MultiTableFilters = Record<string, TableFilterValues>;

interface TableFiltersContextType {
  tables: MultiTableFilters;
  setTableFilters: (tableId: string, filters: TableFilterValues) => void;
  getTableFilters: (tableId: string) => TableFilterValues | undefined;
}

const APIContext = createContext<TableFiltersContextType | undefined>(undefined);

export function TableFiltersContextProvider({
  children,
  initialFilters = {},
}: {
  children: ReactNode;
  initialFilters?: MultiTableFilters;
}) {
  const [tables, setTables] = useState<MultiTableFilters>(initialFilters);

  const setTableFilters = (tableId: string, filters: TableFilterValues) => {
    setTables((prev) => ({
      ...prev,
      [tableId]: { ...prev[tableId], ...filters },
    }));
  };

  const getTableFilters = (tableId: string) => tables[tableId];

  return (
    <APIContext.Provider value={{ tables, setTableFilters, getTableFilters }}>
      {children}
    </APIContext.Provider>
  );
}

export function useTableFilters(tableId: string) {
  const context = useContext(APIContext);
  if (!context) throw new Error("useTableFilters must be used within a TableFiltersContextProvider");

  return {
    tableFilters: context.getTableFilters(tableId),
    setTableFiltersForTable: (filters: TableFilterValues) =>
      context.setTableFilters(tableId, filters),
  };
}