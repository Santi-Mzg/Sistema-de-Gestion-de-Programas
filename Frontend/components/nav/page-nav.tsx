// components/ui/data-pagination.tsx

"use client"

import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

interface PageNavigationProps {
  page: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  itemLabel?: string
}

export function PageNavigation({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = "elementos",
}: PageNavigationProps) {
  if (totalElements === 0) {
    return null
  }

  const firstItem = page * pageSize + 1
  const lastItem = Math.min((page + 1) * pageSize, totalElements)

  const getVisiblePages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    if (page <= 3) {
      return [0, 1, 2, 3, 4, "...", totalPages - 1]
    }

    if (page >= totalPages - 4) {
      return [
        0,
        "...",
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      ]
    }

    return [
      0,
      "...",
      page - 1,
      page,
      page + 1,
      "...",
      totalPages - 1,
    ]
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex flex-col gap-3 py-4 px-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {firstItem}
          </span>
          {" – "}
          <span className="font-medium text-foreground">
            {lastItem}
          </span>
          {" de "}
          <span className="font-medium text-foreground">
            {totalElements}
          </span>{" "}
          {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Filas por página:</span>

            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value))
                onPageChange(0)
              }}
              className="h-8 rounded-md border bg-background px-2 text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 0}
          onClick={() => onPageChange(0)}
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </Button>

        {visiblePages.map((pageItem, index) => {
          if (pageItem === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                ...
              </span>
            )
          }

          return (
            <Button
              key={pageItem}
              variant={pageItem === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(pageItem)}
            >
              {pageItem + 1}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          title="Página siguiente"
        >
          <ChevronRight size={16} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          title="Última página"
        >
          <ChevronsRight size={16} />
        </Button>
      </div>
    </div>
  )
}