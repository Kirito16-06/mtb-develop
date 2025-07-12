import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export interface Transaction {
  id: string;
  createdAt: string;
  jpAmount: number;
  activity: {
    activity: string;
    transactionType: string;
    displayName: string;
  };
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => (
      <div>
        {format(new Date(row.original.createdAt), "MMM d, yyyy hh:mm a")}
      </div>
    ),
  },
  {
    accessorKey: "activity.displayName",
    header: "Activity",
  },
  {
    accessorKey: "activity.transactionType",
    header: "Type",
  },
  {
    accessorKey: "jpAmount",
    header: "JP Amount",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.jpAmount} JP</div>
    ),
  },
];
