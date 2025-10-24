export type navItem = {
    title: string
    url: string
    icon: React.ReactNode
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}