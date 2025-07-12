import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/tw";
import { TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";

interface SkeletonListProps {
  count?: number;
  className?: string;
  containerClassName?: string;
}

export const SkeletonList = ({
  count = 4,
  className,
  containerClassName,
}: SkeletonListProps) => {
  return (
    <div className={cn("space-y-4", containerClassName)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("w-full h-16", className)} />
      ))}
    </div>
  );
};

interface SkeletonListTableProps<TData> {
  rowCount?: number;
  columnCount?: number;
  className?: string;
  containerClassName?: string;
  cellClassName?: string;
  columns: ColumnDef<TData, unknown>[];
}

// * to be used with shadcn data table only
export const SkeletonListTable = <TData,>({
  //   rowCount = 4,
  rowCount = 5,
  //   className,
  //   containerClassName,
  // cellClassName,
  columns,
}: SkeletonListTableProps<TData>) => {
  return (
    // <div className={cn("w-full", containerClassName)}>
    //   <div className={cn("space-y-3", className)}>
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <TableRow key={`loading-${index}`}>
          {columns.map((_, cellIndex) => (
            <TableCell key={`loading-cell-${cellIndex}`}>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
    //             {Array.from({ length: rowCount }).map((_, rowIndex) => (
    //     <div key={`row-${rowIndex}`} className="flex items-center gap-4 w-full">
    //   </div>
    //   ))}
    //   </div>
    // </div>
  );
};
