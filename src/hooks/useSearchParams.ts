"use client"

import { usePathname, useRouter, useSearchParams as useNextSearchParams } from "next/navigation"
import { useCallback } from "react"

/**
 * Reusable hook for managing URL search parameters
 * Syncs application state with URL query params for bookmarkable/shareable URLs
 */
export function useSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useNextSearchParams()

  /**
   * Get a single search parameter value
   */
  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key)
    },
    [searchParams],
  )

  /**
   * Get all search parameters as an object
   */
  const getAllParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  /**
   * Set multiple search parameters at once
   * Removes parameters with null/undefined values
   */
  const setParams = useCallback(
    (params: Record<string, string | number | null | undefined>, replace = false) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      // Update or remove parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "" || value === "all") {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      })

      // Update URL
      const newUrl = `${pathname}?${newSearchParams.toString()}`
      if (replace) {
        router.replace(newUrl)
      } else {
        router.push(newUrl)
      }
    },
    [pathname, router, searchParams],
  )

  /**
   * Set a single search parameter
   */
  const setParam = useCallback(
    (key: string, value: string | number | null | undefined, replace = false) => {
      setParams({ [key]: value }, replace)
    },
    [setParams],
  )

  /**
   * Remove specific search parameters
   */
  const removeParams = useCallback(
    (keys: string[], replace = false) => {
      const paramsToRemove = keys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as Record<string, null>)
      setParams(paramsToRemove, replace)
    },
    [setParams],
  )

  /**
   * Clear all search parameters
   */
  const clearParams = useCallback(
    (replace = false) => {
      const newUrl = pathname
      if (replace) {
        router.replace(newUrl)
      } else {
        router.push(newUrl)
      }
    },
    [pathname, router],
  )

  return {
    getParam,
    getAllParams,
    setParam,
    setParams,
    removeParams,
    clearParams,
  }
}