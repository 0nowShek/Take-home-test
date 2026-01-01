import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton for reminder card
 * Matches the structure of actual reminder cards
 */
export function ReminderCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  )
}

/**
 * Multiple skeleton cards for initial load
 */
export function ReminderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ReminderCardSkeleton key={i} />
      ))}
    </div>
  )
}