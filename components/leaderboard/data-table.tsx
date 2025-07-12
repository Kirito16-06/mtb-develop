"use client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_LEADERBOARD_PAGE,
  DEFAULT_LEADERBOARD_PAGE_LIMIT,
} from "@/lib/constant";



interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  totalPages: number;
 
}

export function DataTable<TData>({
  columns,
  data,
  totalPages,
 
}: DataTableProps<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || DEFAULT_LEADERBOARD_PAGE;
  const limit =
   Number(searchParams.get("limit")) || DEFAULT_LEADERBOARD_PAGE_LIMIT;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: totalPages || 0,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  });

  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", (newPage + 1).toString());
    newSearchParams.set("limit", limit.toString());
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

 

  return (
    <div className="mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
            key={headerGroup.id}
            className="text-gray-700 uppercase text-sm text-center"
            >
              
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="p-4 text-gray-700 uppercase text-sm text-center font-bold"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={`border-b text-center ${
                (row.original as { rank: number }).rank === 1
                  ? "bg-[#F4D17C] hover:bg-[#F4D17C]"
                  : (row.original as { rank: number }).rank === 2
                  ? "bg-[#E4E4E4] hover:bg-[#E4E4E4]"
                  : (row.original as { rank: number }).rank === 3
                  ? "bg-[#D7C6AB] hover:bg-[#D7C6AB]"
                  : "bg-white hover:bg-white"
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="p-4 text-base">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {/* this table body changed by toheed */}
      

      </Table>

      {/* pagination controls */}
      <div className="flex items-center justify-end space-x-2 pt-6 pb-8 px-8">
        <div className="space-x-2 flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(0)}
            disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 2)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center gap-1">
            <strong>
              {page} of {totalPages}
            </strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={page >= totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
