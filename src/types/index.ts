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

export type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
};