"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: Array<{
    value: string
    onValueChange: (value: string) => void
    options: Array<{ value: string; label: string }>
    placeholder?: string
  }>
  showFilterButton?: boolean
  onFilterClick?: () => void
}

export function FilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  showFilterButton = false,
  onFilterClick,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 py-3 px-4 lg:px-6 border-b border-black/10 bg-white">
      {/* Search Input */}
      {onSearchChange && (
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="focus-visible:ring-black border-black/10"
          />
        </div>
      )}

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2">
          {filters.map((filter, index) => (
            <Select key={index} value={filter.value} onValueChange={filter.onValueChange}>
              <SelectTrigger className="w-[180px] focus:ring-black border-black/10">
                <SelectValue placeholder={filter.placeholder || "Selecione"} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      {/* Filter Button (for advanced filters modal/drawer) */}
      {showFilterButton && onFilterClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterClick}
          className="ml-auto border-black/10 hover:bg-black/5"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      )}
    </div>
  )
}
