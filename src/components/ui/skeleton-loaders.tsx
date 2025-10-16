import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const AssignmentCardSkeleton = () => (
  <Card className="mb-2">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PhotographerTableRowSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
    <TableCell className="text-right">
      <div className="flex gap-2 justify-end">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </TableCell>
  </TableRow>
);

export const AnalyticsCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-4">
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent className="h-[350px] flex items-center justify-center">
      <div className="space-y-4 w-full px-8">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    </CardContent>
  </Card>
);

export const SummaryCardSkeleton = () => (
  <button className="w-full text-left p-6 rounded-lg border bg-card transition-colors">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  </button>
);
