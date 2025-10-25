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