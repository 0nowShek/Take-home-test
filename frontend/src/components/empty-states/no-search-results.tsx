import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Empty state for when search/filter returns no results
 */
interface NoSearchResultsProps {
  searchTerm?: string
  onClearFilters?: () => void
}

export function NoSearchResults({ searchTerm, onClearFilters }: NoSearchResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <SearchX className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-2xl font-semibold mb-2">No results found</h3>
      
      <p className="text-muted-foreground mb-6 max-w-sm">
        {searchTerm 
          ? `We couldn't find any reminders matching "${searchTerm}"`
          : "No reminders match your current filters"}
      </p>
      
      {onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Clear Filters
        </Button>
      )}
    </div>
  )
}