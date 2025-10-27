export interface navItem {
    title: string
    url: string
    icon: React.ReactNode
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
}

export interface FilterOption {
  value: string 
  label: string
}

export interface DataTableFilterField<TData> {
  label: string
  value: keyof TData | string
  placeholder?: string
  options?: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
    count?: number
  }[]
  isSlider?: boolean
  isDateRange?: boolean
}

export interface DataTableFilterOption<TData> extends DataTableFilterField<TData> {
  id: string
  filterValues?: string[]
  filterOperator?: string
}

export type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
};